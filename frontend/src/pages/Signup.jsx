import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      setSuccess(response.data.message || "Signup Successful!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup Failed");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* BLACK HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>Enterprise Document Intelligence</div>
      </header>

      {/* SIGNUP SECTION */}
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Create Account</h1>

            <p style={styles.subtitle}>
              Create your account to access the document intelligence workspace.
            </p>
          </div>

          <form onSubmit={handleSignup}>
            {/* NAME */}
            <label style={styles.label}>Full Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />

            {/* EMAIL */}
            <label style={styles.label}>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />

            {/* PASSWORD */}
            <label style={styles.label}>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* SUCCESS */}
            {success && <div style={styles.success}>{success}</div>}

            {/* ERROR */}
            {error && <div style={styles.error}>{error}</div>}
          </form>

          {/* LOGIN LINK */}
          <div style={styles.footer}>
            <span>Already have an account?</span>

            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.loginLink}
            >
              Sign In
            </button>
          </div>
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
    width: "420px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "36px",
    boxSizing: "border-box",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
  },

  titleSection: {
    marginBottom: "30px",
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

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    height: "46px",
    padding: "0 13px",
    marginBottom: "20px",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff",
  },

  button: {
    width: "100%",
    height: "46px",
    marginTop: "4px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "600",
  },

  success: {
    marginTop: "16px",
    padding: "11px 12px",
    background: "#ecfdf3",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    borderRadius: "7px",
    fontSize: "13px",
  },

  error: {
    marginTop: "16px",
    padding: "11px 12px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    fontSize: "13px",
  },

  footer: {
    marginTop: "28px",
    paddingTop: "22px",
    borderTop: "1px solid #eeeeee",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#6b7280",
  },

  loginLink: {
    border: "none",
    background: "transparent",
    color: "#111111",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
    fontSize: "13px",
  },
};
