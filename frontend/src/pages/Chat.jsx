import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD THE EXACT CHAT FROM URL
  // ==========================================

  useEffect(() => {
    if (!chatId) {
      setLoadingChat(false);
      return;
    }

    loadChat(chatId);
  }, [chatId]);

  const loadChat = async (id) => {
    try {
      setLoadingChat(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get(`/chat/history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("LOADED CHAT:", response.data);

      setMessages(response.data.messages || []);
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.log("LOAD CHAT ERROR:", err);

      setError(err.response?.data?.message || "Unable to load chat.");

      setMessages([]);
      setDocuments([]);
    } finally {
      setLoadingChat(false);
    }
  };

  // ==========================================
  // ASK QUESTION
  // ==========================================

  const handleAsk = async () => {
    if (!question.trim()) {
      return;
    }

    if (!chatId) {
      setError("No chat selected.");
      return;
    }

    if (documents.length === 0) {
      setError("This chat has no document. Upload a document first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const document = documents[0];

      const response = await api.post(
        "/chat/ask",
        {
          chatId: chatId,
          documentId: document._id,
          question: question.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("ASK RESPONSE:", response.data);

      // Stay in the SAME chat
      setMessages(response.data.messages || []);

      setQuestion("");
    } catch (err) {
      console.log("ASK ERROR:", err);

      setError(err.response?.data?.message || "Unable to get answer.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // ==========================================
  // NO CHAT SELECTED
  // ==========================================

  if (!chatId) {
    return (
      <Layout>
        <div style={styles.center}>
          <h2>No Chat Selected</h2>

          <p>Please create a new chat from the dashboard.</p>

          <button
            onClick={() => navigate("/dashboard")}
            style={styles.secondaryButton}
          >
            Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingChat) {
    return (
      <Layout>
        <div style={styles.center}>Loading chat...</div>
      </Layout>
    );
  }

  // ==========================================
  // CHAT UI
  // ==========================================

  return (
    <Layout>
      <div style={styles.container}>
        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <div style={styles.pageLabel}>DOCUMENT CHAT</div>

            <h1 style={styles.title}>Ask anything about your document</h1>

            <p style={styles.subtitle}>
              Get answers grounded in your uploaded document.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={styles.dashboardButton}
          >
            ← Dashboard
          </button>
        </div>

        {/* DOCUMENT */}

        {documents.length > 0 ? (
          <div style={styles.documentBox}>
            <div style={styles.documentIcon}>📄</div>

            <div>
              <div style={styles.documentLabel}>CURRENT DOCUMENT</div>

              <div style={styles.documentName}>{documents[0].originalName}</div>
            </div>
          </div>
        ) : (
          <div style={styles.uploadBox}>
            <div style={styles.uploadIcon}>📄</div>

            <h3>No document attached</h3>

            <p>Upload a document to this chat before asking questions.</p>

            <button
              onClick={() => navigate(`/upload?chatId=${chatId}`)}
              style={styles.primaryButton}
            >
              Upload Document
            </button>
          </div>
        )}

        {/* ERROR */}

        {error && <div style={styles.error}>{error}</div>}

        {/* MESSAGES */}

        <div style={styles.messages}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>✦</div>

              <h2>Ask anything about your document</h2>

              <p>
                Upload a document and ask questions to get answers grounded in
                its content.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  background: message.role === "user" ? "#eef4ff" : "#ffffff",
                  marginLeft: message.role === "user" ? "80px" : "0",
                  marginRight: message.role === "user" ? "0" : "80px",
                }}
              >
                <div style={styles.messageRole}>
                  {message.role === "user" ? "You" : "AI Assistant"}
                </div>

                <p style={styles.messageContent}>{message.content}</p>
              </div>
            ))
          )}
        </div>

        {/* INPUT */}

        <div style={styles.inputSection}>
          <div style={styles.inputArea}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || documents.length === 0}
              placeholder={
                documents.length === 0
                  ? "Upload a document first..."
                  : "Ask a question about your document..."
              }
              style={styles.input}
            />

            <button
              onClick={handleAsk}
              disabled={loading || documents.length === 0}
              style={{
                ...styles.askButton,
                opacity: loading || documents.length === 0 ? 0.5 : 1,
              }}
            >
              {loading ? "..." : "↑"}
            </button>
          </div>

          <div style={styles.inputHint}>
            Press Enter to send · Shift + Enter for a new line
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 80px)",
    background: "#f7f9fc",
    padding: "45px 55px",
  },

  center: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    maxWidth: "1200px",
    margin: "0 auto 30px auto",
  },

  pageLabel: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  title: {
    margin: "0",
    color: "#172033",
    fontSize: "32px",
    fontWeight: "700",
  },

  subtitle: {
    color: "#718096",
    fontSize: "16px",
    marginTop: "10px",
  },

  dashboardButton: {
    padding: "11px 20px",
    background: "#111827",
    color: "#ffffff",
    border: "1px solid #334155",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },

  documentBox: {
    maxWidth: "1200px",
    margin: "0 auto 25px auto",
    padding: "18px 22px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  documentIcon: {
    width: "45px",
    height: "45px",
    background: "#eef4ff",
    borderRadius: "9px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
  },

  documentLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  documentName: {
    marginTop: "4px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#172033",
  },

  uploadBox: {
    maxWidth: "1200px",
    margin: "0 auto 25px auto",
    padding: "35px",
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },

  uploadIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  primaryButton: {
    padding: "11px 22px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  secondaryButton: {
    padding: "11px 22px",
    background: "#64748b",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },

  error: {
    maxWidth: "1200px",
    margin: "15px auto",
    padding: "12px 16px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
  },

  messages: {
    maxWidth: "1200px",
    margin: "25px auto",
    minHeight: "350px",
  },

  emptyState: {
    minHeight: "350px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#172033",
  },

  emptyIcon: {
    width: "70px",
    height: "70px",
    background: "#eef4ff",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    color: "#2563eb",
    marginBottom: "20px",
  },

  message: {
    padding: "18px 20px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  messageRole: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: "8px",
  },

  messageContent: {
    margin: "0",
    color: "#334155",
    fontSize: "15px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },

  inputSection: {
    maxWidth: "1200px",
    margin: "30px auto 0 auto",
  },

  inputArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "8px 10px 8px 18px",
    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.06)",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px 5px",
    fontSize: "16px",
    color: "#172033",
    background: "transparent",
  },

  askButton: {
    width: "48px",
    height: "48px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "25px",
    cursor: "pointer",
  },

  inputHint: {
    textAlign: "center",
    marginTop: "10px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  empty: {
    textAlign: "center",
    color: "#777",
  },
};
