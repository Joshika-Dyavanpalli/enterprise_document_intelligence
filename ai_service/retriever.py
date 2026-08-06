from embeddings import model
from faiss_index import FAISSIndex


def retrieve_chunks(question, vector_path, chunks_path):

    faiss_index = FAISSIndex()

    chunks = faiss_index.load(
        vector_path,
        chunks_path
    )

    query_embedding = model.encode(question)

    indices = faiss_index.search(query_embedding)

    return [chunks[i] for i in indices]