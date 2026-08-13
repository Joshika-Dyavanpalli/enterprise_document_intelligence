import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Documents() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (currentUser) {
      setUserRole(currentUser.role);
    }

    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

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

      setError(err.response?.data?.message || "Unable to delete document.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>My Documents</h1>

            <p style={styles.subtitle}>
              View and manage your uploaded documents and conversations.
            </p>
          </div>

          <div style={styles.loadingCard}>Loading documents...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Documents</h1>

          <p style={styles.subtitle}>View and query your uploaded documents.</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {opening && <div style={styles.opening}>Opening document chat...</div>}

        {documents.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>▤</div>

            <h2 style={styles.emptyTitle}>No documents yet</h2>

            <p style={styles.emptyText}>
              Upload a document to start asking questions.
            </p>

            {userRole !== "Viewer" && (
              <button
                onClick={() => navigate("/upload")}
                style={styles.newChatButton}
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div style={styles.documentList}>
            {documents.map((doc) => (
              <div key={doc._id} style={styles.documentCard}>
                <div style={styles.documentInfo}>
                  <div style={styles.documentIcon}>▤</div>

                  <div style={styles.documentDetails}>
                    <h3 style={styles.documentName}>{doc.originalName}</h3>

                    <div style={styles.documentMeta}>
                      <span>{doc.fileType || "Document"}</span>

                      <span style={styles.dot}>•</span>

                      <span>Uploaded document</span>
                    </div>
                  </div>
                </div>

                <div style={styles.actions}>
                  {/* Viewer, Editor and Admin can open/query */}
                  <button
                    onClick={() => openChat(doc)}
                    disabled={opening}
                    style={{
                      ...styles.openButton,
                      opacity: opening ? 0.6 : 1,
                      cursor: opening ? "not-allowed" : "pointer",
                    }}
                  >
                    {opening ? "Opening..." : "Open Chat"}
                  </button>

                  {/* Only Admin can delete */}
                  {userRole !== "Viewer" && (
                    <button
                      onClick={() => deleteDocument(doc._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "650",
    color: "#171717",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  error: {
    marginBottom: "20px",
    padding: "11px 13px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    fontSize: "13px",
  },

  opening: {
    marginBottom: "20px",
    padding: "11px 13px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
  },

  documentList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  documentCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "22px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
  },

  documentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: 0,
    flex: 1,
  },

  documentIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    fontWeight: "700",
    flexShrink: 0,
  },

  documentDetails: {
    minWidth: 0,
  },

  documentName: {
    margin: 0,
    color: "#171717",
    fontSize: "17px",
    fontWeight: "600",
    wordBreak: "break-word",
  },

  documentMeta: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "13px",
  },

  dot: {
    color: "#9ca3af",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "25px",
    flexShrink: 0,
  },

  openButton: {
    padding: "11px 20px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
  },

  deleteButton: {
    padding: "11px 20px",
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "55px 30px",
    textAlign: "center",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
  },

  emptyIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto 18px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#171717",
  },

  emptyText: {
    maxWidth: "500px",
    margin: "10px auto 22px",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#6b7280",
  },

  newChatButton: {
    padding: "11px 22px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  loadingCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "30px 50px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
  },
};
