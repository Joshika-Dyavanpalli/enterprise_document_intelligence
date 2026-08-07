import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("document");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <h1>Enterprise Document Intelligence</h1>

      <h3>Welcome, {user?.name || "User"} 👋</h3>

      <p>
        <strong>Role:</strong> {user?.role || "Viewer"}
      </p>

      <br />

      <button onClick={() => navigate("/upload")} style={styles.button}>
        Upload Document
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/documents")} style={styles.button}>
        My Documents
      </button>

      <br />
      <br />

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
    width: "220px",
    padding: "12px",
    cursor: "pointer",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  },

  logoutButton: {
    width: "220px",
    padding: "12px",
    cursor: "pointer",
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  },
};
