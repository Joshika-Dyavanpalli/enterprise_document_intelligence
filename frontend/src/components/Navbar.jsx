import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("document");

    navigate("/");
  };

  return (
    <header style={styles.navbar}>
      <div style={styles.logo} onClick={() => navigate("/dashboard")}>
        Enterprise Document Intelligence
      </div>

      <div style={styles.rightSection}>
        <button
          onClick={() => navigate("/profile")}
          style={styles.profileButton}
        >
          <div style={styles.avatar}>
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>

          <span>{user?.name || "User"}</span>
        </button>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    height: "68px",
    background: "#111111",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    boxSizing: "border-box",
  },

  logo: {
    fontSize: "20px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "-0.3px",
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
  },

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "13px",
  },

  logoutButton: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
