import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function Upload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const chatId = searchParams.get("chatId");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    setMessage("");
    setError("");

    if (!chatId) {
      setError("No chat selected. Please create a new chat first.");
      return;
    }

    if (!file) {
      setError("Please select a document.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("document", file);
      formData.append("chatId", chatId);

      const response = await api.post("/auth/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Document uploaded and attached to this chat!");

      // Return to SAME chat
      setTimeout(() => {
        navigate(`/chat/${chatId}`);
      }, 500);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Document upload failed.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Document</h2>

      <p>Upload a document to this conversation.</p>

      {!chatId && (
        <p style={styles.error}>
          No chat selected. Please create a new chat first.
        </p>
      )}

      <input
        type="file"
        onChange={(e) => {
          setFile(e.target.files[0]);
          setMessage("");
          setError("");
        }}
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        disabled={loading || !chatId}
        style={styles.primaryButton}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      <br />
      <br />

      {message && <p style={styles.success}>{message}</p>}

      {error && <p style={styles.error}>{error}</p>}

      <button
        onClick={() =>
          chatId ? navigate(`/chat/${chatId}`) : navigate("/dashboard")
        }
        style={styles.secondaryButton}
      >
        Back
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
  },

  primaryButton: {
    padding: "12px 25px",
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

  success: {
    color: "green",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    fontWeight: "bold",
  },
};
