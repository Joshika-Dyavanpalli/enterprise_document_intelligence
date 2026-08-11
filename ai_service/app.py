from fastapi import FastAPI, UploadFile, File
import os
import shutil
import fitz
from docx import Document
from PIL import Image
import pytesseract
from pydantic import BaseModel
import requests
import uuid

from chunking import chunk_text
from embeddings import generate_embeddings
from faiss_index import FAISSIndex
from retriever import retrieve_chunks
from prompt import build_prompt
from vector_service import create_vector_store


# Tesseract OCR path
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


app = FastAPI()


UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "AI Service Running"
    }


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = ""

    # --------------------------------------------------
    # PDF
    # --------------------------------------------------

    if file.filename.lower().endswith(".pdf"):

        pdf = fitz.open(file_path)

        for page_number, page in enumerate(pdf):

            # First try normal text extraction
            page_text = page.get_text()

            if page_text.strip():

                extracted_text += (
                    f"\n--- Page {page_number + 1} ---\n"
                )

                extracted_text += page_text

            else:

                # No text found → scanned/image PDF
                print(
                    f"No text found on page {page_number + 1}. "
                    "Running OCR..."
                )

                pix = page.get_pixmap()

                image = Image.frombytes(
                    "RGB",
                    [pix.width, pix.height],
                    pix.samples,
                )

                ocr_text = pytesseract.image_to_string(
                    image
                )

                extracted_text += (
                    f"\n--- Page {page_number + 1} ---\n"
                )

                extracted_text += ocr_text

        pdf.close()

    # --------------------------------------------------
    # DOCX
    # --------------------------------------------------

    elif file.filename.lower().endswith(".docx"):

        doc = Document(file_path)

        for paragraph in doc.paragraphs:

            extracted_text += (
                paragraph.text + "\n"
            )

    # --------------------------------------------------
    # IMAGE
    # --------------------------------------------------

    elif (
        file.filename.lower().endswith(".png")
        or file.filename.lower().endswith(".jpg")
        or file.filename.lower().endswith(".jpeg")
    ):

        image = Image.open(file_path)

        extracted_text = pytesseract.image_to_string(
            image
        )

    # --------------------------------------------------
    # Unsupported file
    # --------------------------------------------------

    else:

        return {
            "success": False,
            "message": "Unsupported file type."
        }

    # --------------------------------------------------
    # Check whether text was extracted
    # --------------------------------------------------

    if not extracted_text.strip():

        return {
            "success": False,
            "message": "Unable to extract text from this document."
        }

    # --------------------------------------------------
    # Create document vector store
    # --------------------------------------------------

    document_id = str(uuid.uuid4())

    index_path, chunks_path, chunk_count = create_vector_store(
        document_id,
        extracted_text
    )

    return {
        "success": True,
        "text": extracted_text,
        "document_id": document_id,
        "vector_path": index_path,
        "chunks_path": chunks_path,
        "chunk_count": chunk_count
    }


# ------------------------------------------------------
# Query
# ------------------------------------------------------

class QueryRequest(BaseModel):

    vector_path: str
    chunks_path: str
    question: str


@app.post("/query")
async def query_document(request: QueryRequest):

    from vector_service import load_vector_store
    from embeddings import model
    import re

    # --------------------------------------------------
    # LOAD VECTOR STORE
    # --------------------------------------------------

    index, chunks = load_vector_store(
        request.vector_path,
        request.chunks_path
    )

    # --------------------------------------------------
    # CREATE QUESTION EMBEDDING
    # --------------------------------------------------

    query_embedding = model.encode(
        request.question
    )

    # --------------------------------------------------
    # SEARCH RELEVANT CHUNKS
    # --------------------------------------------------

    D, I = index.search(
        query_embedding.reshape(1, -1),
        5
    )

    relevant_chunks = []

    for idx in I[0]:

        if idx != -1:

            relevant_chunks.append(
                chunks[idx]
            )

    # --------------------------------------------------
    # EXTRACT SOURCE PAGES
    # --------------------------------------------------

    sources = []

    for chunk in relevant_chunks:

        page_matches = re.findall(
            r"\[Page (\d+)\]",
            chunk
        )

        for page in page_matches:

            page_number = int(page)

            if page_number not in sources:
                sources.append(page_number)

    sources.sort()

    # --------------------------------------------------
    # COMBINE CONTEXT
    # --------------------------------------------------

    context = "\n\n".join(
        relevant_chunks
    )

    # --------------------------------------------------
    # BUILD PROMPT
    # --------------------------------------------------

    prompt = build_prompt(
        context,
        request.question
    )

    # --------------------------------------------------
    # SEND TO OLLAMA
    # --------------------------------------------------

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2",
            "prompt": prompt,
            "stream": False
        }
    )

    response.raise_for_status()

    result = response.json()

    # --------------------------------------------------
    # RETURN ANSWER + CITATIONS
    # --------------------------------------------------

    return {
        "success": True,
        "answer": result["response"],
        "chunks_used": len(relevant_chunks),
        "sources": [
            {
                "page": page
            }
            for page in sources
        ]
    }