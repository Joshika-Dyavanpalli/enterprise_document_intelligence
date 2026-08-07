import { useState } from "react";
import api from "../services/api";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const document = JSON.parse(localStorage.getItem("document"));

  if (!document) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No Document Uploaded</h2>
        <p>Please upload a document before chatting with the AI.</p>
      </div>
    );
  }

  const handleAsk = async () => {
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/auth/ask",
        {
          documentId: document._id,
          question,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAnswer(response.data.answer);
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
    <div style={{ padding: "40px" }}>
      <h1>Ask Questions</h1>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        style={{
          width: "500px",
          padding: "10px",
        }}
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        style={{
          marginLeft: "10px",
          padding: "10px 20px",
        }}
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      <br />
      <br />

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {answer && (
        <>
          <h3>Answer</h3>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              background: "#f8f8f8",
              whiteSpace: "pre-wrap",
            }}
          >
            {answer}
          </div>
        </>
      )}
    </div>
  );
}
