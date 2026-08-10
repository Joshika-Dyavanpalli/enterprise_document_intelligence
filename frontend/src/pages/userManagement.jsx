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
      <div style={styles.container}>
        <h2>Loading Users...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>User Management</h1>

      <p>Manage user roles</p>

      {error && <p style={styles.error}>{error}</p>}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={styles.userList}>
          {users.map((user) => (
            <div key={user._id} style={styles.userCard}>
              <div>
                <h3>{user.name}</h3>

                <p>{user.email}</p>

                <strong>Current Role: {user.role}</strong>
              </div>

              <select
                value={user.role}
                disabled={updatingUser === user._id}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                style={styles.select}
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  userList: {
    marginTop: "30px",
  },

  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "15px",
  },

  select: {
    padding: "10px",
    fontSize: "15px",
  },

  error: {
    color: "#c62828",
    background: "#ffebee",
    padding: "12px",
    borderRadius: "6px",
  },
};
