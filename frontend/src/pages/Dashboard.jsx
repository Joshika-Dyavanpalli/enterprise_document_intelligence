import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Enterprise Document Intelligence</h1>

      <br />

      <button onClick={() => navigate("/upload")} style={styles.button}>
        Upload Document
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/chat")} style={styles.button}>
        Chat with Documents
      </button>
    </div>
  );
}

const styles = {
  button: {
    padding: "12px 20px",
    cursor: "pointer",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};
