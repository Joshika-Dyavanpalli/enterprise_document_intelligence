import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingChat, setOpeningChat] = useState(false);
  const [error, setError] = useState("");

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

      setDocuments(response.data.documents || []);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to load documents.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  /*
    Open an existing document.

    A NEW chat is created and the existing document
    is attached to that chat.

    The user does NOT need to upload the document again.
  */
  const openChat = async (document) => {
    try {
      setOpeningChat(true);
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

      if (err.response) {
        setError(err.response.data.message || "Unable to open document chat.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setOpeningChat(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      await api.delete(`/auth/document/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchDocuments();
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to delete document.");
      } else {
        setError("Unable to connect to the server.");
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading documents...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Documents</h2>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backButton}
        >
          Back to Dashboard
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {openingChat && (
        <div style={styles.loadingMessage}>Opening document chat...</div>
      )}

      {documents.length === 0 ? (
        <div style={styles.empty}>
          <h3>No documents uploaded.</h3>

          <p>Start a new chat from the dashboard to upload a document.</p>

          <button
            onClick={() => navigate("/dashboard")}
            style={styles.backButton}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        documents.map((doc) => (
          <div key={doc._id} style={styles.documentCard}>
            <h3>{doc.originalName}</h3>

            <p>
              <strong>Type:</strong> {doc.fileType}
            </p>

            <button
              onClick={() => openChat(doc)}
              disabled={openingChat}
              style={{
                ...styles.primaryButton,
                opacity: openingChat ? 0.6 : 1,
              }}
            >
              {openingChat ? "Opening..." : "Open Chat"}
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

  documentCard: {
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

  backButton: {
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
    padding: "12px",
    marginBottom: "15px",
    background: "#ffebee",
    color: "#c62828",
    borderRadius: "6px",
  },

  loadingMessage: {
    padding: "12px",
    marginBottom: "15px",
    background: "#e3f2fd",
    color: "#1565c0",
    borderRadius: "6px",
  },
};
