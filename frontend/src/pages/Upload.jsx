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
      setError("No chat selected. Please start a new chat first.");
      return;
    }

    if (!file) {
      setError("Please select a document.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("document", file);
    formData.append("chatId", chatId);

    try {
      const token = localStorage.getItem("token");

      const response = await api.post("/auth/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedDocument = response.data.document;

      console.log("Uploaded document:", uploadedDocument);

      setMessage("Document uploaded successfully!");

      // Return to the SAME chat
      setTimeout(() => {
        navigate(`/chat/${chatId}`);
      }, 800);
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

      <p>Upload a document to use in your current conversation.</p>

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
        disabled={loading}
        style={styles.uploadButton}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      <br />
      <br />

      {message && <p style={styles.success}>{message}</p>}

      {error && <p style={styles.error}>{error}</p>}

      <br />

      <button
        onClick={() =>
          chatId ? navigate(`/chat/${chatId}`) : navigate("/dashboard")
        }
        style={styles.backButton}
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

  uploadButton: {
    padding: "10px 25px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  backButton: {
    padding: "10px 25px",
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
