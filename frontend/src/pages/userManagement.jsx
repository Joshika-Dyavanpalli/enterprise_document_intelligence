import { useEffect, useState } from "react";
import api from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUser, setUpdatingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users || []);
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to load users.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUser(userId);
      setError("");

      const token = localStorage.getItem("token");

      await api.patch(
        `/auth/users/${userId}/role`,
        {
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchUsers();
    } catch (err) {
      console.log(err);

      if (err.response) {
        setError(err.response.data.message || "Unable to update user role.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.logo}>Enterprise Document Intelligence</div>
        </header>

        <main style={styles.main}>
          <div style={styles.loadingCard}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading users...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>Enterprise Document Intelligence</div>
      </header>

      {/* MAIN */}
      <main style={styles.main}>
        <div style={styles.card}>
          {/* TITLE */}
          <div style={styles.titleSection}>
            <h1 style={styles.title}>User Management</h1>

            <p style={styles.subtitle}>
              Manage users and control their access roles.
            </p>
          </div>

          {/* ERROR */}
          {error && <div style={styles.error}>{error}</div>}

          {/* USERS */}
          {users.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>—</div>

              <h3 style={styles.emptyTitle}>No users found</h3>

              <p style={styles.emptyText}>
                There are currently no users available to manage.
              </p>
            </div>
          ) : (
            <div style={styles.userList}>
              {users.map((user) => (
                <div key={user._id} style={styles.userCard}>
                  {/* USER INFORMATION */}
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <h3 style={styles.userName}>{user.name}</h3>

                      <p style={styles.email}>{user.email}</p>

                      <div style={styles.roleText}>
                        Current role: <strong>{user.role}</strong>
                      </div>
                    </div>
                  </div>

                  {/* ROLE SELECT */}
                  <div style={styles.roleSection}>
                    <label style={styles.roleLabel}>Role</label>

                    <select
                      value={user.role}
                      disabled={updatingUser === user._id}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      style={{
                        ...styles.select,
                        opacity: updatingUser === user._id ? 0.6 : 1,
                      }}
                    >
                      <option value="Viewer">Viewer</option>

                      <option value="Editor">Editor</option>

                      <option value="Admin">Admin</option>
                    </select>

                    {updatingUser === user._id && (
                      <span style={styles.updating}>Updating...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    padding: "45px 20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "950px",
    margin: "0 auto",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "36px",
    boxSizing: "border-box",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
  },

  titleSection: {
    marginBottom: "30px",
    borderBottom: "1px solid #eeeeee",
    paddingBottom: "22px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "650",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  userList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    padding: "18px 20px",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    background: "#ffffff",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  avatar: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "50%",
    background: "#111111",
    color: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "600",
  },

  userName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
  },

  email: {
    margin: "3px 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  roleText: {
    marginTop: "4px",
    color: "#6b7280",
    fontSize: "12px",
  },

  roleSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    minWidth: "145px",
  },

  roleLabel: {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "5px",
  },

  select: {
    width: "145px",
    height: "38px",
    padding: "0 10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#171717",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
  },

  updating: {
    marginTop: "5px",
    fontSize: "11px",
    color: "#6b7280",
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

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    border: "1px dashed #d1d5db",
    borderRadius: "9px",
    background: "#fafafa",
  },

  emptyIcon: {
    fontSize: "28px",
    color: "#9ca3af",
  },

  emptyTitle: {
    margin: "10px 0 5px",
    fontSize: "16px",
  },

  emptyText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "400px",
    margin: "100px auto",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxSizing: "border-box",
  },

  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #111111",
    borderRadius: "50%",
    margin: "0 auto",
  },

  loadingText: {
    marginTop: "15px",
    color: "#6b7280",
    fontSize: "14px",
  },
};
