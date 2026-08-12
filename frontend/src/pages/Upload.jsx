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
    <div style={styles.page}>
      {/* BLACK HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>Enterprise Document Intelligence</div>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Upload Document</h1>

            <p style={styles.subtitle}>
              Add a document to this conversation and start asking questions
              about its contents.
            </p>
          </div>

          {/* NO CHAT */}
          {!chatId && (
            <div style={styles.errorBox}>
              No chat selected. Please create a new chat first.
            </div>
          )}

          {/* FILE SELECT AREA */}
          <label style={styles.fileArea}>
            <div style={styles.fileIcon}>↑</div>

            <div style={styles.fileTitle}>
              {file ? file.name : "Choose a document"}
            </div>

            <div style={styles.fileSubtitle}>
              {file
                ? "Document selected"
                : "Click here to select a file from your computer"}
            </div>

            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setMessage("");
                setError("");
              }}
              style={styles.fileInput}
            />
          </label>

          {/* SELECTED FILE */}
          {file && (
            <div style={styles.selectedFile}>
              <div>
                <div style={styles.selectedLabel}>Selected document</div>

                <div style={styles.selectedName}>{file.name}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setMessage("");
                  setError("");
                }}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>
          )}

          {/* UPLOAD */}
          <button
            onClick={handleUpload}
            disabled={loading || !chatId}
            style={{
              ...styles.primaryButton,
              opacity: loading || !chatId ? 0.55 : 1,
              cursor: loading || !chatId ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>

          {/* SUCCESS */}
          {message && <div style={styles.successBox}>{message}</div>}

          {/* ERROR */}
          {error && <div style={styles.errorBox}>{error}</div>}

          {/* BACK */}
          <button
            onClick={() =>
              chatId ? navigate(`/chat/${chatId}`) : navigate("/dashboard")
            }
            style={styles.secondaryButton}
          >
            Back
          </button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#171717",
  },

  header: {
    height: "72px",
    background: "#111111",
    display: "flex",
    alignItems: "center",
    padding: "0 40px",
    boxSizing: "border-box",
  },

  logo: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "600",
    letterSpacing: "-0.3px",
  },

  main: {
    minHeight: "calc(100vh - 72px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  card: {
    width: "520px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "36px",
    boxSizing: "border-box",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
  },

  titleSection: {
    marginBottom: "28px",
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "650",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  fileArea: {
    position: "relative",
    display: "block",
    border: "1.5px dashed #cbd5e1",
    borderRadius: "9px",
    padding: "35px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: "#fafafa",
    marginBottom: "18px",
  },

  fileIcon: {
    width: "42px",
    height: "42px",
    margin: "0 auto 12px auto",
    borderRadius: "50%",
    background: "#111111",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "500",
  },

  fileTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#171717",
    wordBreak: "break-word",
  },

  fileSubtitle: {
    marginTop: "6px",
    fontSize: "13px",
    color: "#6b7280",
  },

  fileInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },

  selectedFile: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "13px 14px",
    marginBottom: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
  },

  selectedLabel: {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "3px",
  },

  selectedName: {
    fontSize: "13px",
    fontWeight: "600",
    wordBreak: "break-word",
  },

  removeButton: {
    background: "transparent",
    border: "none",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  primaryButton: {
    width: "100%",
    height: "46px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "600",
  },

  secondaryButton: {
    width: "100%",
    height: "44px",
    marginTop: "12px",
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },

  successBox: {
    marginTop: "16px",
    padding: "11px 12px",
    background: "#ecfdf3",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    borderRadius: "7px",
    fontSize: "13px",
  },

  errorBox: {
    marginBottom: "16px",
    padding: "11px 12px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    fontSize: "13px",
  },
};
