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
import re

from embeddings import generate_embeddings
from prompt import build_prompt
from vector_service import create_vector_store, load_vector_store


# --------------------------------------------------
# TESSERACT OCR PATH
# --------------------------------------------------

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# --------------------------------------------------
# FASTAPI
# --------------------------------------------------

app = FastAPI()


# --------------------------------------------------
# FOLDERS
# --------------------------------------------------

UPLOAD_FOLDER = "uploads"
VECTOR_FOLDER = "vector_store"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VECTOR_FOLDER, exist_ok=True)


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "AI Service Running"
    }


# ==================================================
# UPLOAD DOCUMENT
# ==================================================

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    # --------------------------------------------------
    # SAVE UPLOADED FILE
    # --------------------------------------------------

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    extracted_text = ""


    # ==================================================
    # PDF
    # ==================================================

    if file.filename.lower().endswith(".pdf"):

        pdf = fitz.open(file_path)

        for page_number, page in enumerate(pdf):

            actual_page_number = page_number + 1

            # --------------------------------------------------
            # FIRST TRY NORMAL TEXT EXTRACTION
            # --------------------------------------------------

            page_text = page.get_text()

            if page_text.strip():

                print(
                    f"Text extracted from PDF page "
                    f"{actual_page_number}"
                )

                extracted_text += (
                    f"\n--- Page {actual_page_number} ---\n"
                )

                extracted_text += page_text


            # --------------------------------------------------
            # OCR FALLBACK
            # --------------------------------------------------

            else:

                print(
                    f"No text found on PDF page "
                    f"{actual_page_number}. "
                    f"Running OCR..."
                )

                pix = page.get_pixmap()

                image = Image.frombytes(
                    "RGB",
                    [pix.width, pix.height],
                    pix.samples
                )

                ocr_text = pytesseract.image_to_string(
                    image
                )

                extracted_text += (
                    f"\n--- Page {actual_page_number} ---\n"
                )

                extracted_text += ocr_text

        pdf.close()


    # ==================================================
    # DOCX
    # ==================================================

    elif file.filename.lower().endswith(".docx"):

        doc = Document(file_path)

        extracted_text += "\n--- Page 1 ---\n"

        for paragraph in doc.paragraphs:

            extracted_text += (
                paragraph.text + "\n"
            )


    # ==================================================
    # IMAGE
    # ==================================================

    elif (
        file.filename.lower().endswith(".png")
        or file.filename.lower().endswith(".jpg")
        or file.filename.lower().endswith(".jpeg")
    ):

        print("Running OCR on image...")

        image = Image.open(file_path)

        ocr_text = pytesseract.image_to_string(
            image
        )

        extracted_text += (
            "\n--- Page 1 ---\n"
        )

        extracted_text += ocr_text


    # ==================================================
    # UNSUPPORTED FILE
    # ==================================================

    else:

        return {
            "success": False,
            "message": "Unsupported file type."
        }


    # ==================================================
    # CHECK EXTRACTION
    # ==================================================

    if not extracted_text.strip():

        return {
            "success": False,
            "message": (
                "Unable to extract text from this document."
            )
        }


    # ==================================================
    # CREATE DOCUMENT ID
    # ==================================================

    document_id = str(uuid.uuid4())


    # ==================================================
    # CREATE VECTOR STORE
    # ==================================================

    index_path, chunks_path, chunk_count = (
        create_vector_store(
            document_id,
            extracted_text
        )
    )


    # ==================================================
    # RETURN UPLOAD RESULT
    # ==================================================

    return {
        "success": True,
        "text": extracted_text,
        "document_id": document_id,
        "vector_path": index_path,
        "chunks_path": chunks_path,
        "chunk_count": chunk_count
    }


# ==================================================
# QUERY MODEL
# ==================================================

class QueryRequest(BaseModel):

    vector_path: str
    chunks_path: str
    question: str


# ==================================================
# QUERY DOCUMENT
# ==================================================

@app.post("/query")
async def query_document(
    request: QueryRequest
):

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

    from embeddings import model

    query_embedding = model.encode(
        request.question
    )


    # --------------------------------------------------
    # SEARCH RELEVANT CHUNKS
    # --------------------------------------------------

    distances, indices = index.search(
        query_embedding.reshape(1, -1),
        5
    )


    relevant_chunks = []

    for idx in indices[0]:

        if idx != -1:

            relevant_chunks.append(
                chunks[idx]
            )


    # --------------------------------------------------
    # EXTRACT REAL SOURCE PAGES
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

                sources.append(
                    page_number
                )


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


    # --------------------------------------------------
    # GET LLM RESPONSE
    # --------------------------------------------------

    result = response.json()

    answer = result["response"].strip()


    # --------------------------------------------------
    # REMOVE ANY PAGE CITATIONS GENERATED BY LLM
    # --------------------------------------------------

    answer = re.sub(
        r"\s*\[Page\s+\d+\]",
        "",
        answer
    ).strip()


    # --------------------------------------------------
    # CHECK IF ANSWER WAS NOT FOUND
    # --------------------------------------------------

    not_found_message = (
        "I couldn't find that information in the document."
    )


    # --------------------------------------------------
    # ADD REAL SOURCE CITATIONS
    # --------------------------------------------------

    if (
        answer
        and answer != not_found_message
        and sources
    ):

        citation = " ".join(
            f"[Page {page}]"
            for page in sources
        )

        answer = (
            f"{answer} {citation}"
        )


    # --------------------------------------------------
    # RETURN ANSWER
    # --------------------------------------------------

    return {
        "success": True,
        "answer": answer,
        "chunks_used": len(relevant_chunks),
        "sources": [
            {
                "page": page
            }
            for page in sources
        ]
    }