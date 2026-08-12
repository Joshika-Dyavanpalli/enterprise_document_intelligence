import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login Response:", response.data);

      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      setSuccess("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.log(error);

      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("Unable to connect to the server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* BLACK HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>Enterprise Document Intelligence</div>
      </header>

      {/* LOGIN SECTION */}
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>
              Sign in to access your documents and AI-powered workspace.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <label style={styles.label}>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />

            <label style={styles.label}>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {success && <div style={styles.success}>{success}</div>}

            {error && <div style={styles.error}>{error}</div>}
          </form>

          <div style={styles.footer}>
            <span>Don't have an account?</span>

            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={styles.signupLink}
            >
              Create Account
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

  signupLink: {
    border: "none",
    background: "transparent",
    color: "#111111",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
    fontSize: "13px",
  },
};
