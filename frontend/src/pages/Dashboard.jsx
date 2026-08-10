import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("document");

    navigate("/");
  };

  const handleNewChat = async () => {
    try {
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
        alert(err.response.data.message || "Unable to create new chat.");
      } else {
        alert("Unable to connect to the server.");
      }
    }
  };


  return (
    <div style={styles.container}>
      <h1>Enterprise Document Intelligence</h1>

      <h3>Welcome, {user?.name || "User"} 👋</h3>

      <p>
        <strong>Role:</strong> {user?.role || "Viewer"}
      </p>

      <br />

      {/* NEW CHAT */}

      <button onClick={handleNewChat} style={styles.button}>
        + New Chat
      </button>

      <br />
      <br />

      {/* MY DOCUMENTS */}

      <button onClick={() => navigate("/documents")} style={styles.button}>
        My Documents
      </button>

      <br />
      <br />

      {/* LOGOUT */}

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
    width: "285px",
    padding: "12px",
    cursor: "pointer",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  },

  logoutButton: {
    width: "285px",
    padding: "12px",
    cursor: "pointer",
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  },
};
