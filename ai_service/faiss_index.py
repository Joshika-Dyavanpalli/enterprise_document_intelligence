import faiss
import numpy as np
import pickle


class FAISSIndex:

    def __init__(self):
        self.index = None

    def build(self, embeddings):

        embeddings = np.array(embeddings).astype("float32")

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatL2(dimension)

        self.index.add(embeddings)

    def save(self, index_path, chunks_path, chunks):

        faiss.write_index(self.index, index_path)

        with open(chunks_path, "wb") as f:
            pickle.dump(chunks, f)

    def load(self, index_path, chunks_path):

        self.index = faiss.read_index(index_path)

        with open(chunks_path, "rb") as f:
            chunks = pickle.load(f)

        return chunks

    def search(self, query_embedding, k=3):

        query_embedding = np.array([query_embedding]).astype("float32")

        distances, indices = self.index.search(query_embedding, k)

        return indices[0]