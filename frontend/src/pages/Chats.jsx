import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Chats() {
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChats(response.data.chats || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async () => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <div style={styles.center}>Loading chats...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Chats</h2>

        <button onClick={createChat} style={styles.primaryButton}>
          + New Chat
        </button>
      </div>

      {chats.length === 0 ? (
        <div style={styles.empty}>
          <h3>No previous chats</h3>

          <button onClick={createChat} style={styles.primaryButton}>
            Start New Chat
          </button>
        </div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            style={styles.chatCard}
            onClick={() => navigate(`/chat/${chat._id}`)}
          >
            <h3>{chat.title || "New Chat"}</h3>

            <p>Messages: {chat.messages?.length || 0}</p>

            {chat.documents?.length > 0 && (
              <p>Document: {chat.documents[0].originalName}</p>
            )}

            <small>Updated: {new Date(chat.updatedAt).toLocaleString()}</small>
          </div>
        ))
      )}

      <br />

      <button
        onClick={() => navigate("/dashboard")}
        style={styles.secondaryButton}
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

  center: {
    padding: "40px",
    textAlign: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  chatCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "15px",
    cursor: "pointer",
  },

  primaryButton: {
    padding: "10px 20px",
    background: "#1976d2",
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
  },
};
