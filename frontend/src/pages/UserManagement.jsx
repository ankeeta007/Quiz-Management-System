import { useEffect, useState } from "react";

function UserManagement() {
  const API_URL = "https://quiz-management-system-o5i7.onrender.com/api";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/auth/users/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("USERS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch users."
        );
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.results)) {
        setUsers(data.results);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("User management error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // ACTIVATE / DEACTIVATE USER
  // =====================================================

  const handleToggleStatus = async (user) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const newStatus = user.is_active === false;

    const confirmed = window.confirm(
      newStatus
        ? `Activate user "${user.username}"?`
        : `Deactivate user "${user.username}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/auth/users/${user.id}/status/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: newStatus,
          }),
        }
      );

      const data = await response.json();

      console.log("STATUS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update user status."
        );
      }

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_active: newStatus,
              }
            : item
        )
      );

      setSuccess(
        newStatus
          ? `${user.username} has been activated.`
          : `${user.username} has been deactivated.`
      );
    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDeleteUser = async (user) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    // Prevent accidentally deleting an admin account
    if (user.role === "ADMIN") {
      setError(
        "Admin accounts cannot be deleted from User Management."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.username}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/auth/users/${user.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("DELETE USER RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete user."
        );
      }

      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) => item.id !== user.id
        )
      );

      setSuccess(
        `${user.username} has been deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredUsers = users.filter((user) => {
    const searchText = `
      ${user.username || ""}
      ${user.email || ""}
      ${user.first_name || ""}
      ${user.last_name || ""}
      ${user.role || ""}
    `.toLowerCase();

    return searchText.includes(
      search.toLowerCase()
    );
  });

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <h2>User Management</h2>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            User Management
          </h1>

          <p style={styles.subtitle}>
            Manage students and administrators
          </p>
        </div>

        <div style={styles.totalBox}>

          <span style={styles.totalNumber}>
            {users.length}
          </span>

          <span>
            Total Users
          </span>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div style={styles.errorBox}>

          <strong>
            Error
          </strong>

          <p style={{ marginBottom: 0 }}>
            {error}
          </p>

        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div style={styles.successBox}>

          <strong>
            Success
          </strong>

          <p style={{ marginBottom: 0 }}>
            {success}
          </p>

        </div>
      )}

      {/* =================================================
          SEARCH
      ================================================= */}

      <div style={styles.searchSection}>

        <input
          type="text"
          placeholder="Search by username, email, name or role..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={styles.searchInput}
        />

      </div>

      {/* =================================================
          RESULT COUNT
      ================================================= */}

      {!error && (
        <div style={styles.resultInfo}>

          Showing{" "}

          <strong>
            {filteredUsers.length}
          </strong>

          {" "}of{" "}

          <strong>
            {users.length}
          </strong>

          {" "}users

        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!error && filteredUsers.length === 0 && (
        <div style={styles.empty}>

          <h3>
            No users found
          </h3>

          <p>
            {search
              ? "Try a different search."
              : "No users are registered yet."}
          </p>

        </div>
      )}

      {/* =================================================
          USER TABLE
      ================================================= */}

      {!error && filteredUsers.length > 0 && (
        <div style={styles.tableContainer}>

          <div style={styles.tableScroll}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    ID
                  </th>

                  <th style={styles.th}>
                    Username
                  </th>

                  <th style={styles.th}>
                    Email
                  </th>

                  <th style={styles.th}>
                    First Name
                  </th>

                  <th style={styles.th}>
                    Last Name
                  </th>

                  <th style={styles.th}>
                    Role
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    {/* ID */}

                    <td style={styles.td}>
                      {user.id}
                    </td>

                    {/* USERNAME */}

                    <td style={styles.td}>
                      <strong>
                        {user.username || "-"}
                      </strong>
                    </td>

                    {/* EMAIL */}

                    <td style={styles.td}>
                      {user.email || "-"}
                    </td>

                    {/* FIRST NAME */}

                    <td style={styles.td}>
                      {user.first_name || "-"}
                    </td>

                    {/* LAST NAME */}

                    <td style={styles.td}>
                      {user.last_name || "-"}
                    </td>

                    {/* ROLE */}

                    <td style={styles.td}>

                      <span
                        style={
                          user.role === "ADMIN"
                            ? styles.adminBadge
                            : styles.studentBadge
                        }
                      >
                        {user.role || "STUDENT"}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td style={styles.td}>

                      {user.is_active === false ? (

                        <span
                          style={styles.inactiveBadge}
                        >
                          Inactive
                        </span>

                      ) : (

                        <span
                          style={styles.activeBadge}
                        >
                          Active
                        </span>

                      )}

                    </td>

                    {/* ACTIONS */}

                    <td style={styles.td}>

                      <div style={styles.actionContainer}>

                        {/* ACTIVATE / DEACTIVATE */}

                        <button
                          onClick={() =>
                            handleToggleStatus(user)
                          }
                          disabled={actionLoading}
                          style={
                            user.is_active === false
                              ? styles.activateButton
                              : styles.deactivateButton
                          }
                        >
                          {user.is_active === false
                            ? "Activate"
                            : "Deactivate"}
                        </button>

                        {/* DELETE */}

                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                            disabled={actionLoading}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {

  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    color: "#222",
    fontSize: "32px",
  },

  subtitle: {
    color: "#666",
    marginTop: "8px",
    marginBottom: 0,
  },

  totalBox: {
    backgroundColor: "white",
    padding: "15px 25px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#555",
  },

  totalNumber: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  errorBox: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b91c1c",
    padding: "15px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  successBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    padding: "15px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  searchSection: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
  },

  resultInfo: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "15px",
  },

  tableContainer: {
    backgroundColor: "white",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  tableScroll: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  th: {
    backgroundColor: "#f8fafc",
    padding: "15px",
    textAlign: "left",
    color: "#444",
    borderBottom: "1px solid #ddd",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    color: "#555",
    whiteSpace: "nowrap",
  },

  adminBadge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  studentBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  inactiveBadge: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  actionContainer: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  activateButton: {
    padding: "7px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#16a34a",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  deactivateButton: {
    padding: "7px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#f59e0b",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  deleteButton: {
    padding: "7px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#dc2626",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  empty: {
    backgroundColor: "white",
    padding: "50px",
    textAlign: "center",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  loadingBox: {
    backgroundColor: "white",
    padding: "40px",
    textAlign: "center",
    borderRadius: "10px",
    maxWidth: "500px",
    margin: "80px auto",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },
};

export default UserManagement;