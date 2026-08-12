import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Chats() {
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChats(response.data.chats || []);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to load chats.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const createChat = async () => {
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
        setError(err.response.data.message || "Unable to create new chat.");
      } else {
        setError("Unable to connect to the server.");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingCard}>Loading chats...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        {/* PAGE HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>CONVERSATIONS</div>

            <h1 style={styles.title}>My Chats</h1>

            <p style={styles.subtitle}>
              View your previous conversations and continue asking questions
              about your documents.
            </p>
          </div>

          <button onClick={createChat} style={styles.newChatButton}>
            + New Chat
          </button>
        </div>

        {/* ERROR */}
        {error && <div style={styles.error}>{error}</div>}

        {/* EMPTY STATE */}
        {chats.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>+</div>

            <h2 style={styles.emptyTitle}>No previous chats</h2>

            <p style={styles.emptyText}>
              Start a new conversation and upload a document to begin asking
              questions.
            </p>

            <button onClick={createChat} style={styles.startButton}>
              Start New Chat
            </button>
          </div>
        ) : (
          <div style={styles.chatList}>
            {chats.map((chat) => (
              <div
                key={chat._id}
                style={styles.chatCard}
                onClick={() => navigate(`/chat/${chat._id}`)}
              >
                <div style={styles.chatIcon}>💬</div>

                <div style={styles.chatInfo}>
                  <h3 style={styles.chatTitle}>{chat.title || "New Chat"}</h3>

                  <div style={styles.chatMeta}>
                    <span>Messages: {chat.messages?.length || 0}</span>

                    {chat.documents?.length > 0 && (
                      <>
                        <span style={styles.dot}>•</span>

                        <span>{chat.documents[0].originalName}</span>
                      </>
                    )}
                  </div>

                  <small style={styles.updated}>
                    Updated: {new Date(chat.updatedAt).toLocaleString()}
                  </small>
                </div>

                <div style={styles.arrow}>→</div>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "28px",
    gap: "20px",
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "650",
    color: "#171717",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  newChatButton: {
    padding: "11px 20px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    flexShrink: 0,
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

  chatList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  chatCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
    transition: "box-shadow 0.2s ease",
  },

  chatIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "9px",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  chatInfo: {
    flex: 1,
    minWidth: 0,
  },

  chatTitle: {
    margin: 0,
    color: "#171717",
    fontSize: "16px",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  chatMeta: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "13px",
    overflow: "hidden",
  },

  dot: {
    color: "#9ca3af",
  },

  updated: {
    display: "block",
    marginTop: "6px",
    color: "#9ca3af",
    fontSize: "12px",
  },

  arrow: {
    color: "#9ca3af",
    fontSize: "20px",
    flexShrink: 0,
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
    background: "#f3f4f6",
    color: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
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

  startButton: {
    padding: "11px 22px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "300px",
  },

  loadingCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "30px 50px",
    color: "#6b7280",
    fontSize: "14px",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
  },
};
