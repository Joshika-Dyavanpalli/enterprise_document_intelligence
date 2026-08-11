import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

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

      // IMPORTANT:
      // Stay in the SAME chat.
      // Do NOT create another chat here.
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
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingChat) {
    return <div style={styles.center}>Loading chat...</div>;
  }

  // ==========================================
  // CHAT UI
  // ==========================================

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Chat</h2>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.secondaryButton}
        >
          Dashboard
        </button>
      </div>

      {/* DOCUMENT */}

      {documents.length > 0 ? (
        <div style={styles.documentBox}>
          <strong>Document:</strong> {documents[0].originalName}
        </div>
      ) : (
        <div style={styles.uploadBox}>
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
          <p style={styles.empty}>No messages in this chat yet.</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                background: message.role === "user" ? "#e3f2fd" : "#f5f5f5",
              }}
            >
              <strong>{message.role === "user" ? "You" : "AI"}</strong>

              <p style={styles.messageContent}>{message.content}</p>
            </div>
          ))
        )}
      </div>

      {/* INPUT */}

      <div style={styles.inputArea}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || documents.length === 0}
          placeholder={
            documents.length === 0
              ? "Upload a document first..."
              : "Ask a question..."
          }
          style={styles.input}
        />

        <button
          onClick={handleAsk}
          disabled={loading || documents.length === 0}
          style={{
            ...styles.askButton,
            background:
              loading || documents.length === 0 ? "#9e9e9e" : "#1976d2",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
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
  },

  documentBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#f5f5f5",
    borderRadius: "6px",
  },

  uploadBox: {
    marginTop: "20px",
    padding: "25px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  messages: {
    marginTop: "25px",
    minHeight: "300px",
  },

  message: {
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  messageContent: {
    marginTop: "8px",
    whiteSpace: "pre-wrap",
  },

  inputArea: {
    display: "flex",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  askButton: {
    padding: "12px 25px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  primaryButton: {
    padding: "12px 25px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "10px 20px",
    background: "#757575",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  error: {
    marginTop: "15px",
    padding: "12px",
    background: "#ffebee",
    color: "#c62828",
    borderRadius: "6px",
  },

  empty: {
    textAlign: "center",
    color: "#777",
  },
};
