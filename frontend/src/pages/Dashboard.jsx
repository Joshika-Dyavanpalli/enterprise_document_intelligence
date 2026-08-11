import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("document");

    navigate("/");
  };

  const handleNewChat = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Enterprise Document Intelligence</h1>

      <h3>Welcome, {user?.name || "User"} 👋</h3>

      <p>
        <strong>Role:</strong> {user?.role || "Viewer"}
      </p>

      <br />

      {/* Error message */}
      {error && <div style={styles.error}>{error}</div>}

      {/* NEW CHAT */}
      <button
        onClick={handleNewChat}
        disabled={loading}
        style={{
          ...styles.button,
          background: loading ? "#9e9e9e" : "#1976d2",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating Chat..." : "+ New Chat"}
      </button>

      <br />
      <br />

      {/* MY DOCUMENTS */}
      <button onClick={() => navigate("/documents")} style={styles.button}>
        My Documents
      </button>

      <br />
      <br />

      {/* LOGOUT */}
      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
  },

  button: {
    width: "285px",
    padding: "12px",
    cursor: "pointer",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  },

  logoutButton: {
    width: "285px",
    padding: "12px",
    cursor: "pointer",
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  },

  error: {
    width: "285px",
    margin: "0 auto 20px auto",
    padding: "12px",
    background: "#ffebee",
    color: "#c62828",
    border: "1px solid #ef9a9a",
    borderRadius: "6px",
    fontWeight: "bold",
  },
};
