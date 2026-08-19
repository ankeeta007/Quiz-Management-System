import { useEffect, useState } from "react";

function CategoryManagement() {
  const API_URL = "https://quiz-management-system-o5i7.onrender.com/api/categories/";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      console.log("CATEGORIES RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to fetch categories."
        );
      }

      setCategories(
        Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error("Category fetch error:", err);
      setError(
        err.message || "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingCategory
        ? `${API_URL}${editingCategory.id}/`
        : API_URL;

      const method = editingCategory
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      console.log("CATEGORY SAVE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to save category."
        );
      }

      alert(
        editingCategory
          ? "Category updated successfully!"
          : "Category created successfully!"
      );

      setName("");
      setDescription("");
      setEditingCategory(null);

      await fetchCategories();
    } catch (err) {
      console.error("Category save error:", err);

      setError(
        err.message || "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (category) => {
    setEditingCategory(category);

    setName(category.name || "");
    setDescription(category.description || "");

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (categoryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}${categoryId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to delete category."
        );
      }

      alert("Category deleted successfully!");

      await fetchCategories();
    } catch (err) {
      console.error("Category delete error:", err);

      setError(
        err.message || "Unable to delete category."
      );
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setError("");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <h2>Category Management</h2>
          <p>Loading categories...</p>
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
            Category Management
          </h1>

          <p style={styles.subtitle}>
            Create and manage quiz categories
          </p>
        </div>

        <div style={styles.totalBox}>
          <span style={styles.totalNumber}>
            {categories.length}
          </span>

          <span style={styles.totalLabel}>
            Total Categories
          </span>
        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* =================================================
          CREATE / EDIT FORM
      ================================================= */}

      <div style={styles.formCard}>

        <div style={styles.formHeader}>

          <div>
            <h2 style={styles.cardTitle}>
              {editingCategory
                ? "Edit Category"
                : "Create Category"}
            </h2>

            <p style={styles.cardSubtitle}>
              {editingCategory
                ? "Update the selected quiz category."
                : "Add a new category for your quizzes."}
            </p>
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* CATEGORY NAME */}

          <div style={styles.formGroup}>

            <label style={styles.label}>
              Category Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter category name"
              style={styles.input}
              disabled={saving}
              required
            />

          </div>

          {/* DESCRIPTION */}

          <div style={styles.formGroup}>

            <label style={styles.label}>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter category description"
              rows={4}
              style={styles.textarea}
              disabled={saving}
            />

          </div>

          {/* BUTTONS */}

          <div style={styles.buttonGroup}>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.primaryButton,
                ...(saving
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {saving
                ? "Saving..."
                : editingCategory
                ? "Update Category"
                : "Create Category"}
            </button>

            {editingCategory && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* =================================================
          CATEGORY LIST
      ================================================= */}

      <div style={styles.listCard}>

        <div style={styles.listHeader}>

          <div>
            <h2 style={styles.cardTitle}>
              All Categories
            </h2>

            <p style={styles.cardSubtitle}>
              Manage existing quiz categories
            </p>
          </div>

          <span style={styles.countBadge}>
            {categories.length}{" "}
            {categories.length === 1
              ? "Category"
              : "Categories"}
          </span>

        </div>

        {/* EMPTY STATE */}

        {categories.length === 0 ? (

          <div style={styles.empty}>

            <div style={styles.emptyIcon}>
              📁
            </div>

            <h3 style={styles.emptyTitle}>
              No categories found
            </h3>

            <p style={styles.emptyText}>
              Create your first quiz category
              using the form above.
            </p>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div style={styles.tableContainer}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    ID
                  </th>

                  <th style={styles.th}>
                    Category Name
                  </th>

                  <th style={styles.th}>
                    Description
                  </th>

                  <th style={styles.th}>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {categories.map((category) => (

                  <tr
                    key={category.id}
                    style={styles.tableRow}
                  >

                    <td style={styles.td}>
                      <span style={styles.idBadge}>
                        {category.id}
                      </span>
                    </td>

                    <td style={styles.td}>

                      <strong
                        style={styles.categoryName}
                      >
                        {category.name ||
                          "-"}
                      </strong>

                    </td>

                    <td style={styles.td}>

                      <span
                        style={styles.description}
                      >
                        {category.description ||
                          "No description"}
                      </span>

                    </td>

                    <td style={styles.td}>

                      <div style={styles.actionGroup}>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          style={styles.editButton}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              category.id
                            )
                          }
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "40px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
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
    fontSize: "32px",
    color: "#1f2937",
  },

  subtitle: {
    margin: "8px 0 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },

  totalBox: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "14px 22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  totalNumber: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  totalLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },

  errorBox: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b91c1c",
    padding: "14px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "30px",
    maxWidth: "850px",
    boxSizing: "border-box",
  },

  formHeader: {
    marginBottom: "24px",
  },

  cardTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "21px",
  },

  cardSubtitle: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#ffffff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#ffffff",
  },

  buttonGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  cancelButton: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },

  countBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "700px",
    borderCollapse: "collapse",
  },

  th: {
    backgroundColor: "#f8fafc",
    padding: "15px",
    textAlign: "left",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "bold",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tableRow: {
    backgroundColor: "#ffffff",
  },

  td: {
    padding: "15px",
    color: "#4b5563",
    fontSize: "14px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle",
  },

  idBadge: {
    display: "inline-block",
    minWidth: "25px",
    textAlign: "center",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  categoryName: {
    color: "#1f2937",
  },

  description: {
    color: "#6b7280",
  },

  actionGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  editButton: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },

  deleteButton: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },

  empty: {
    padding: "50px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },

  emptyTitle: {
    margin: 0,
    color: "#374151",
    fontSize: "18px",
  },

  emptyText: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "8px",
  },

  loadingBox: {
    backgroundColor: "#ffffff",
    maxWidth: "500px",
    margin: "100px auto",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },
};

export default CategoryManagement;