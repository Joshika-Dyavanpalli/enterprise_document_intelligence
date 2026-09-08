import os
import pickle
from collections import OrderedDict

import faiss

from chunking import chunk_text
from embeddings import generate_embeddings
from faiss_index import FAISSIndex


VECTOR_FOLDER = "vector_store"

# Maximum number of document vector stores kept in memory per AI-service process.
MAX_CACHE_SIZE = 50

# LRU cache:
# key   -> (index, chunks)
# newest/recently used items are kept at the end.
_vector_cache = OrderedDict()


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

    # Use the two paths as the cache key.
    cache_key = (index_path, chunks_path)

    # --------------------------------------------------
    # CACHE HIT
    # --------------------------------------------------
    if cache_key in _vector_cache:

        print(
            f"VECTOR CACHE HIT: {index_path}"
        )

        index, chunks = _vector_cache.pop(cache_key)

        # Move recently used item to the end.
        _vector_cache[cache_key] = (index, chunks)

        return index, chunks

    # --------------------------------------------------
    # CACHE MISS
    # --------------------------------------------------
    print(
        f"VECTOR CACHE MISS: {index_path}"
    )

    # Load from shared vector storage.
    index = faiss.read_index(index_path)

    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    # Store in memory.
    _vector_cache[cache_key] = (index, chunks)

    # --------------------------------------------------
    # LRU EVICTION
    # --------------------------------------------------
    if len(_vector_cache) > MAX_CACHE_SIZE:

        oldest_key, _ = _vector_cache.popitem(
            last=False
        )

        print(
            f"VECTOR CACHE EVICT: {oldest_key[0]}"
        )

    print(
        f"VECTOR CACHE STORED: {index_path}"
    )

    return index, chunks