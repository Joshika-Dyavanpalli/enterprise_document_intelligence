import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from retriever import retrieve_chunks
from unittest.mock import Mock, patch

from retriever import retrieve_chunks


@patch("retriever.FAISSIndex")
@patch("retriever.model")
def test_retrieve_chunks_returns_relevant_chunks(mock_model, mock_faiss):
    chunks = [
        "Python is a programming language.",
        "Docker is used for containerization.",
        "FAISS is used for vector similarity search.",
    ]

    mock_model.encode.return_value = [0.1, 0.2, 0.3]

    mock_index_instance = mock_faiss.return_value
    mock_index_instance.load.return_value = chunks
    mock_index_instance.search.return_value = [2, 0]

    result = retrieve_chunks(
        "What is FAISS?",
        "test_vectors.index",
        "test_chunks.pkl",
    )

    mock_model.encode.assert_called_once_with("What is FAISS?")

    mock_index_instance.load.assert_called_once_with(
        "test_vectors.index",
        "test_chunks.pkl",
    )

    mock_index_instance.search.assert_called_once_with(
        [0.1, 0.2, 0.3]
    )

    assert result == [
        "FAISS is used for vector similarity search.",
        "Python is a programming language.",
    ]