import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to load profile.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingCard}>Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.eyebrow}>ACCOUNT</div>

          <h1 style={styles.title}>My Profile</h1>

          <p style={styles.subtitle}>
            View your account information and assigned role.
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {user && (
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div style={styles.info}>
              <div style={styles.row}>
                <span style={styles.label}>Name</span>
                <span style={styles.value}>{user.name || "Not available"}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Email</span>
                <span style={styles.value}>
                  {user.email || "Not available"}
                </span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Role</span>

                <span style={styles.role}>{user.role || "Viewer"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "650",
    color: "#171717",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  profileCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "32px",
    display: "flex",
    alignItems: "flex-start",
    gap: "28px",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
  },

  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#111111",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "600",
    flexShrink: 0,
  },

  info: {
    flex: 1,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid #f0f0f0",
    gap: "20px",
  },

  label: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "600",
  },

  value: {
    color: "#171717",
    fontSize: "14px",
    fontWeight: "500",
  },

  role: {
    padding: "5px 12px",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  error: {
    marginBottom: "20px",
    padding: "11px 13px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    fontSize: "13px",
  },

  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "300px",
  },

  loadingCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "30px 50px",
    color: "#6b7280",
    fontSize: "14px",
  },
};
