import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/auth/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDocuments(response.data.documents);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (document) => {
    localStorage.setItem("document", JSON.stringify(document));
    navigate("/chat");
  };

  const deleteDocument = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/auth/document/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchDocuments();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>My Documents</h1>

      {documents.length === 0 ? (
        <p>No documents uploaded.</p>
      ) : (
        documents.map((doc) => (
          <div
            key={doc._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>{doc.originalName}</h3>

            <p>Type: {doc.fileType}</p>

            <button
              onClick={() => openChat(doc)}
              style={{
                marginRight: "10px",
                padding: "10px 20px",
              }}
            >
              Open Chat
            </button>

            <button
              onClick={() => deleteDocument(doc._id)}
              style={{
                padding: "10px 20px",
                background: "red",
                color: "white",
                border: "none",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
