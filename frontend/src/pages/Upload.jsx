import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const token = localStorage.getItem("token");

      const response = await api.post("/auth/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);

      localStorage.setItem("document", JSON.stringify(response.data.document));

      setMessage("Document Uploaded Successfully!");

      setTimeout(() => {
        navigate("/chat");
      }, 1000);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1>Upload Document</h1>

      <br />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br />
      <br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      <br />
      <br />

      {message && (
        <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
      )}

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
    </div>
  );
}
