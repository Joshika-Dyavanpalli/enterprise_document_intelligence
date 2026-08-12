import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <aside style={styles.sidebar}>
      <button style={styles.navButton} onClick={() => navigate("/dashboard")}>
        <span style={styles.icon}>⌂</span>
        Dashboard
      </button>

      <button style={styles.navButton} onClick={() => navigate("/documents")}>
        <span style={styles.icon}>▣</span>
        My Documents
      </button>

      <button style={styles.navButton} onClick={() => navigate("/chats")}>
        <span style={styles.icon}>💬</span>
        My Chats
      </button>

      <button style={styles.navButton} onClick={() => navigate("/profile")}>
        <span style={styles.icon}>○</span>
        Profile
      </button>

      {user?.role === "Admin" && (
        <button style={styles.navButton} onClick={() => navigate("/users")}>
          <span style={styles.icon}>♙</span>
          User Management
        </button>
      )}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minHeight: "calc(100vh - 68px)",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px 14px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  navButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    background: "transparent",
    border: "none",
    borderRadius: "7px",
    color: "#374151",
    fontSize: "14px",
    textAlign: "left",
    cursor: "pointer",
  },

  icon: {
    width: "20px",
    fontSize: "16px",
    color: "#6b7280",
    textAlign: "center",
  },
};
