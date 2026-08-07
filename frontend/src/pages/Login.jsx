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

      setSuccess("Login Successful!");

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
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleLogin}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {success && (
          <p style={{ color: "green", marginTop: "15px" }}>{success}</p>
        )}

        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },

  form: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#1976d2",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
