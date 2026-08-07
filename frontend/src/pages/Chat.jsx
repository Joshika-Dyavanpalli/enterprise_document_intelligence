import { useState } from "react";
import api from "../services/api";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    try {
      const token = localStorage.getItem("token");
      const document = JSON.parse(localStorage.getItem("document"));

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
        console.log(err.response.data);
        alert(err.response.data.message);
      }
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
        style={{ width: "400px" }}
      />

      <button onClick={handleAsk}>Ask</button>

      <br />
      <br />

      <h3>Answer</h3>

      <p>{answer}</p>
    </div>
  );
}
