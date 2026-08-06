import os
import pickle
import faiss

from chunking import chunk_text
from embeddings import generate_embeddings
from faiss_index import FAISSIndex

VECTOR_FOLDER = "vector_store"


def create_vector_store(document_id, text):

    chunks = chunk_text(text)

    embeddings = generate_embeddings(chunks)

    faiss_index = FAISSIndex()

    faiss_index.build(embeddings)

    index_path = os.path.join(
        VECTOR_FOLDER,
        f"{document_id}.index"
    )

    chunks_path = os.path.join(
        VECTOR_FOLDER,
        f"{document_id}.pkl"
    )

    faiss_index.save(
        index_path,
        chunks_path,
        chunks
    )

    return index_path, chunks_path, len(chunks)


def load_vector_store(index_path, chunks_path):

    index = faiss.read_index(index_path)

    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    return index, chunks