import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <Layout>
      <div style={styles.container}>
        {/* PAGE HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>

          <p style={styles.subtitle}>Enterprise Document Intelligence</p>
        </div>

        {/* WELCOME CARD */}
        <div style={styles.welcomeCard}>
          <div>
            <h2 style={styles.welcomeTitle}>Welcome, {user?.name || "User"}</h2>

            <p style={styles.welcomeText}>
              Manage your documents and start intelligent conversations with
              your files.
            </p>
          </div>

          <div style={styles.roleBadge}>{user?.role || "Viewer"}</div>
        </div>

        {/* ERROR */}
        {error && <div style={styles.error}>{error}</div>}

        {/* ACTION CARDS */}
        <div style={styles.grid}>
          {/* NEW CHAT */}
          <div style={styles.card}>
            <div style={styles.iconBox}>+</div>

            <h3 style={styles.cardTitle}>Start a New Chat</h3>

            <p style={styles.cardText}>
              Create a conversation and upload a document to start asking
              questions.
            </p>

            <button
              onClick={handleNewChat}
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Chat..." : "New Chat"}
            </button>
          </div>

          {/* DOCUMENTS */}
          <div style={styles.card}>
            <div style={styles.iconBox}>▣</div>

            <h3 style={styles.cardTitle}>My Documents</h3>

            <p style={styles.cardText}>
              View your uploaded documents and continue conversations with them.
            </p>

            <button
              onClick={() => navigate("/documents")}
              style={styles.secondaryButton}
            >
              View Documents
            </button>
          </div>
        </div>
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

  welcomeCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#171717",
  },

  welcomeText: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  roleBadge: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "7px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "25px",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
  },

  iconBox: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    background: "#111111",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    marginBottom: "18px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "600",
    color: "#171717",
  },

  cardText: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.6",
    minHeight: "42px",
    margin: "8px 0 20px",
  },

  primaryButton: {
    width: "100%",
    padding: "11px 16px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
  },

  secondaryButton: {
    width: "100%",
    padding: "11px 16px",
    background: "#ffffff",
    color: "#111111",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
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
};
