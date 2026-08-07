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
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSignup}>
        <h2>Signup</h2>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />

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
          {loading ? "Creating Account..." : "Signup"}
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
    background: "#fff",
    padding: "30px",
    width: "350px",
    borderRadius: "10px",
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
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
