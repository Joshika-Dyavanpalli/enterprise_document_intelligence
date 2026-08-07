import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

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

      // Save only the document object
      localStorage.setItem("document", JSON.stringify(response.data.document));

      setMessage("Document Uploaded Successfully!");

      setTimeout(() => {
        navigate("/chat");
      }, 1000);
    } catch (error) {
      console.log(error);

      if (error.response) {
        console.log(error.response.data);
      }

      setMessage("Upload Failed");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Upload Document</h1>

      <br />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br />
      <br />

      <button onClick={handleUpload}>Upload</button>

      <br />
      <br />

      <h3>{message}</h3>
    </div>
  );
}
