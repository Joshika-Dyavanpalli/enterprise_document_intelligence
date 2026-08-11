import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Documents() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

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

      setDocuments(response.data.documents || []);
    } catch (err) {
      console.log(err);
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  };

  // Existing document → NEW chat
  const openChat = async (document) => {
    try {
      setOpening(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/chat/new",
        {
          documentId: document._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const chatId = response.data.chat._id;

      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || "Unable to open document chat.");
    } finally {
      setOpening(false);
    }
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

      setError(err.response?.data?.message || "Unable to delete document.");
    }
  };

  if (loading) {
    return <div style={styles.center}>Loading documents...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Documents</h2>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.secondaryButton}
        >
          Back
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {opening && <p>Opening document chat...</p>}

      {documents.length === 0 ? (
        <div style={styles.empty}>
          <h3>No documents uploaded.</h3>

          <p>Create a new chat first and upload a document there.</p>

          <button
            onClick={() => navigate("/dashboard")}
            style={styles.primaryButton}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        documents.map((doc) => (
          <div key={doc._id} style={styles.card}>
            <h3>{doc.originalName}</h3>

            <p>
              <strong>Type:</strong> {doc.fileType}
            </p>

            <button
              onClick={() => openChat(doc)}
              disabled={opening}
              style={styles.primaryButton}
            >
              Open Chat
            </button>

            <button
              onClick={() => deleteDocument(doc._id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  center: {
    padding: "40px",
    textAlign: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
  },

  primaryButton: {
    padding: "10px 20px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },

  deleteButton: {
    padding: "10px 20px",
    background: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "10px 20px",
    background: "#757575",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    padding: "50px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  error: {
    color: "red",
    fontWeight: "bold",
  },
};
