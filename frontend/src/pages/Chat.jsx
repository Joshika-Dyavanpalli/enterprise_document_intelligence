import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!chatId) {
        setLoadingHistory(false);
        return;
      }

      try {
        setLoadingHistory(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await api.get(`/chat/history/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const chatDocuments = response.data.documents || [];

        setMessages(response.data.messages || []);
        setDocuments(chatDocuments);

        if (chatDocuments.length > 0) {
          setSelectedDocumentId(chatDocuments[0]._id);
        } else {
          setSelectedDocumentId("");
        }
      } catch (err) {
        console.log(err);

        if (err.response) {
          setError(err.response.data.message || "Unable to load chat history.");
        } else {
          setError("Unable to connect to the server.");
        }
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [chatId]);

  /*
    Ask question against the selected document.
  */
  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (!selectedDocumentId) {
      setError("Please upload or attach a document before asking a question.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/chat/ask",
        {
          chatId,
          documentId: selectedDocumentId,
          question: question.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessages(response.data.messages || []);
      setQuestion("");
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to get an answer.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  /*
    Create a completely NEW conversation.
  */
  const handleNewChat = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/chat/new",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate(`/chat/${response.data.chat._id}`);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to create a new chat.");
      } else {
        setError("Unable to connect to the server.");
      }
    }
  };

  /*
    Start a new chat with an already existing document.

    This is useful when the user is inside a conversation
    and wants to create a separate conversation using the
    same document.
  */
  const handleNewChatWithDocument = async (documentId) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/chat/new",
        {
          documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate(`/chat/${response.data.chat._id}`);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to create new chat.");
      } else {
        setError("Unable to connect to the server.");
      }
    }
  };

  if (!chatId) {
    return (
      <div style={styles.centerContainer}>
        <h2>No Chat Selected</h2>

        <p>Start a new conversation to interact with your documents.</p>

        <button onClick={handleNewChat} style={styles.primaryButton}>
          + New Chat
        </button>

        <br />
        <br />

        <button
          onClick={() => navigate("/documents")}
          style={styles.secondaryButton}
        >
          My Documents
        </button>

        <br />
        <br />

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.secondaryButton}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (loadingHistory) {
    return (
      <div style={styles.centerContainer}>
        <h2>Loading chat...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>Chat</h2>

          {documents.length > 0 ? (
            <div>
              <p style={styles.documentText}>Documents in this conversation:</p>

              <select
                value={selectedDocumentId}
                onChange={(e) => setSelectedDocumentId(e.target.value)}
                style={styles.select}
              >
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.originalName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p style={styles.warningText}>No document uploaded yet.</p>
          )}
        </div>

        <button onClick={handleNewChat} style={styles.newChatButton}>
          + New Chat
        </button>
      </div>

      <hr />

      {error && <div style={styles.error}>{error}</div>}

      {documents.length === 0 && (
        <div style={styles.uploadBox}>
          <h3>Upload a document to start chatting</h3>

          <p>
            You cannot ask questions until a document is attached to this
            conversation.
          </p>

          <button
            onClick={() => navigate(`/upload?chatId=${chatId}`)}
            style={styles.primaryButton}
          >
            Upload Document
          </button>

          <br />
          <br />

          <button
            onClick={() => navigate("/documents")}
            style={styles.secondaryButton}
          >
            Choose Existing Document
          </button>
        </div>
      )}

      {documents.length > 0 && (
        <div style={styles.documentList}>
          <h3>Documents</h3>

          {documents.map((doc) => (
            <div key={doc._id} style={styles.documentItem}>
              <span>{doc.originalName}</span>

              <button
                onClick={() => handleNewChatWithDocument(doc._id)}
                style={styles.smallButton}
              >
                New Chat with this
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <p style={styles.emptyMessage}>No messages in this chat yet.</p>
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

      <div style={styles.inputArea}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            documents.length === 0
              ? "Upload a document first..."
              : "Ask a question..."
          }
          disabled={loading || documents.length === 0}
          style={styles.input}
        />

        <button
          onClick={handleAsk}
          disabled={loading || documents.length === 0}
          style={{
            ...styles.askButton,
            background:
              loading || documents.length === 0 ? "#9e9e9e" : "#1976d2",
            cursor:
              loading || documents.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      <br />

      <button
        onClick={() => navigate("/documents")}
        style={styles.secondaryButton}
      >
        My Documents
      </button>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          ...styles.secondaryButton,
          marginLeft: "10px",
        }}
      >
        Dashboard
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  centerContainer: {
    padding: "60px",
    textAlign: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  documentText: {
    color: "#555",
    marginBottom: "8px",
  },

  warningText: {
    color: "#d32f2f",
    fontWeight: "bold",
  },

  select: {
    padding: "10px",
    minWidth: "300px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },

  newChatButton: {
    padding: "10px 18px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },

  uploadBox: {
    marginTop: "25px",
    padding: "25px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
  },

  documentList: {
    marginTop: "25px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  documentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    marginBottom: "8px",
    background: "#f5f5f5",
    borderRadius: "5px",
  },

  smallButton: {
    padding: "7px 12px",
    background: "#757575",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  messagesContainer: {
    marginTop: "25px",
    marginBottom: "25px",
    minHeight: "250px",
  },

  emptyMessage: {
    textAlign: "center",
    color: "#777",
  },

  message: {
    marginBottom: "15px",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  messageContent: {
    marginTop: "8px",
    marginBottom: "0",
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
    fontSize: "16px",
  },

  primaryButton: {
    padding: "12px 25px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
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
    padding: "12px",
    marginTop: "15px",
    background: "#ffebee",
    color: "#c62828",
    borderRadius: "6px",
  },
};
