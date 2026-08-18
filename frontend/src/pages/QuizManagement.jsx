import { useEffect, useState } from "react";

function QuizManagement() {
  const QUIZ_API = "http://127.0.0.1:8000/api/quizzes/";
  const CATEGORY_API = "http://127.0.0.1:8000/api/categories/";

  const emptyForm = {
    title: "",
    description: "",
    category: "",
    difficulty: "Easy",
    duration: "",
    passing_percentage: "",
    max_attempts: "",
    status: "Draft",
  };

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingQuiz(null);
  };

  // =====================================================
  // FETCH QUIZZES
  // =====================================================

  const fetchQuizzes = async () => {
    const token = getToken();

    if (!token) {
      throw new Error("You are not logged in.");
    }

    const response = await fetch(QUIZ_API, {
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
        `Invalid server response (${response.status}).`
      );
    }

    console.log("QUIZZES RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          "Failed to fetch quizzes."
      );
    }

    const quizList = Array.isArray(data.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];

    setQuizzes(quizList);
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    const token = getToken();

    if (!token) {
      throw new Error("You are not logged in.");
    }

    const response = await fetch(CATEGORY_API, {
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
        `Invalid category response (${response.status}).`
      );
    }

    console.log("CATEGORIES RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          "Failed to fetch categories."
      );
    }

    const categoryList = Array.isArray(data.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];

    setCategories(categoryList);
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          fetchQuizzes(),
          fetchCategories(),
        ]);
      } catch (err) {
        console.error("Initial quiz page error:", err);
        setError(
          err.message || "Failed to load quiz data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE FORM
  // =====================================================

  const handleCreate = () => {
    resetForm();
    setError("");
    setShowForm(true);
  };

  // =====================================================
  // EDIT FORM
  // =====================================================

  const handleEdit = (quiz) => {
    console.log("EDIT QUIZ:", quiz);

    setEditingQuiz(quiz);

    setFormData({
      title: quiz.title || "",
      description: quiz.description || "",

      category:
        quiz.category_id ??
        quiz.category?.id ??
        quiz.category ??
        "",

      difficulty: quiz.difficulty || "Easy",

      duration: quiz.duration ?? "",

      passing_percentage:
        quiz.passing_percentage ?? "",

      max_attempts:
        quiz.max_attempts ?? "",

      status: quiz.status || "Draft",
    });

    setError("");
    setShowForm(true);
  };

  // =====================================================
  // CREATE / UPDATE QUIZ
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!formData.title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Quiz description is required.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.duration) {
      setError("Duration is required.");
      return;
    }

    if (
      formData.passing_percentage === "" ||
      formData.passing_percentage === null
    ) {
      setError("Passing percentage is required.");
      return;
    }

    if (!formData.max_attempts) {
      setError("Maximum attempts is required.");
      return;
    }

    const duration = Number(formData.duration);
    const passingPercentage = Number(
      formData.passing_percentage
    );
    const maxAttempts = Number(
      formData.max_attempts
    );

    if (duration <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }

    if (
      passingPercentage < 0 ||
      passingPercentage > 100
    ) {
      setError(
        "Passing percentage must be between 0 and 100."
      );
      return;
    }

    if (maxAttempts <= 0) {
      setError(
        "Maximum attempts must be greater than 0."
      );
      return;
    }

    // -----------------------------------------------
    // PAYLOAD
    // -----------------------------------------------

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: Number(formData.category),
      difficulty: formData.difficulty,
      duration: duration,
      passing_percentage: passingPercentage,
      max_attempts: maxAttempts,
      status: formData.status,
    };

    console.log("QUIZ PAYLOAD:", payload);

    const url = editingQuiz
      ? `${QUIZ_API}${editingQuiz.id}/`
      : QUIZ_API;

    const method = editingQuiz ? "PUT" : "POST";

    try {
      setSaving(true);
      setError("");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      console.log("SAVE QUIZ RESPONSE:", data);

      if (!response.ok) {
        let backendError =
          data.detail ||
          data.error ||
          "";

        if (!backendError) {
          backendError = Object.values(data)
            .flat()
            .join(" ");
        }

        throw new Error(
          backendError || "Failed to save quiz."
        );
      }

      alert(
        editingQuiz
          ? "Quiz updated successfully!"
          : "Quiz created successfully!"
      );

      resetForm();
      setShowForm(false);

      await fetchQuizzes();
    } catch (err) {
      console.error("Save quiz error:", err);

      setError(
        err.message || "Failed to save quiz."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE QUIZ
  // =====================================================

  const handleDelete = async (quizId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quiz?"
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
        `${QUIZ_API}${quizId}/`,
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
          data.detail ||
            data.error ||
            "Failed to delete quiz."
        );
      }

      alert("Quiz deleted successfully!");

      await fetchQuizzes();
    } catch (err) {
      console.error("Delete quiz error:", err);

      setError(
        err.message || "Failed to delete quiz."
      );
    }
  };

  // =====================================================
  // PUBLISH / UNPUBLISH
  // =====================================================

  const handlePublish = async (quiz) => {
    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const isPublished =
      quiz.status === "Published";

    const action = isPublished
      ? "unpublish"
      : "publish";

    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this quiz?`
    );

    if (!confirmAction) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${QUIZ_API}${quiz.id}/publish/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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

      console.log("PUBLISH RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Failed to change quiz status."
        );
      }

      alert(
        isPublished
          ? "Quiz unpublished successfully!"
          : "Quiz published successfully!"
      );

      await fetchQuizzes();
    } catch (err) {
      console.error(
        "Publish/unpublish error:",
        err
      );

      setError(
        err.message ||
          "Failed to change quiz status."
      );
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setError("");
  };

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (quiz) => {
    if (quiz.category_name) {
      return quiz.category_name;
    }

    if (
      quiz.category &&
      typeof quiz.category === "object"
    ) {
      return quiz.category.name || "N/A";
    }

    const category = categories.find(
      (item) =>
        String(item.id) ===
        String(
          quiz.category_id ??
            quiz.category
        )
    );

    return category?.name || "N/A";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <div style={styles.loadingIcon}>
            📝
          </div>

          <h2 style={styles.loadingTitle}>
            Loading quizzes...
          </h2>

          <p style={styles.loadingText}>
            Please wait.
          </p>
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
            Quiz Management
          </h1>

          <p style={styles.subtitle}>
            Create, edit, publish and manage quizzes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          style={styles.createButton}
        >
          + Create Quiz
        </button>

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
          QUIZ LIST
      ================================================= */}

      <div style={styles.tableCard}>

        <div style={styles.tableHeader}>

          <div>
            <h2 style={styles.sectionTitle}>
              All Quizzes
            </h2>

            <p style={styles.sectionSubtitle}>
              Manage all quizzes available on the platform.
            </p>
          </div>

          <span style={styles.countBadge}>
            {quizzes.length}{" "}
            {quizzes.length === 1
              ? "Quiz"
              : "Quizzes"}
          </span>

        </div>

        {quizzes.length === 0 ? (

          <div style={styles.emptyBox}>

            <div style={styles.emptyIcon}>
              📝
            </div>

            <h3 style={styles.emptyTitle}>
              No quizzes found
            </h3>

            <p style={styles.emptyText}>
              Click "Create Quiz" to add your first quiz.
            </p>

          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    ID
                  </th>

                  <th style={styles.th}>
                    Title
                  </th>

                  <th style={styles.th}>
                    Description
                  </th>

                  <th style={styles.th}>
                    Category
                  </th>

                  <th style={styles.th}>
                    Difficulty
                  </th>

                  <th style={styles.th}>
                    Duration
                  </th>

                  <th style={styles.th}>
                    Passing %
                  </th>

                  <th style={styles.th}>
                    Max Attempts
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

                {quizzes.map((quiz) => {

                  const isPublished =
                    quiz.status === "Published";

                  return (
                    <tr key={quiz.id}>

                      <td style={styles.td}>
                        <span style={styles.idBadge}>
                          {quiz.id}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <strong
                          style={styles.quizTitle}
                        >
                          {quiz.title || "-"}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={styles.description}
                        >
                          {quiz.description || "-"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {getCategoryName(quiz)}
                      </td>

                      <td style={styles.td}>

                        <span
                          style={
                            quiz.difficulty ===
                            "Easy"
                              ? styles.easyBadge
                              : quiz.difficulty ===
                                "Medium"
                              ? styles.mediumBadge
                              : styles.hardBadge
                          }
                        >
                          {quiz.difficulty || "-"}
                        </span>

                      </td>

                      <td style={styles.td}>
                        {quiz.duration ?? "-"} min
                      </td>

                      <td style={styles.td}>
                        {quiz.passing_percentage ?? "-"}%
                      </td>

                      <td style={styles.td}>
                        {quiz.max_attempts ?? "-"}
                      </td>

                      <td style={styles.td}>

                        <span
                          style={
                            isPublished
                              ? styles.publishedBadge
                              : quiz.status ===
                                "Unpublished"
                              ? styles.unpublishedBadge
                              : styles.draftBadge
                          }
                        >
                          {quiz.status || "Draft"}
                        </span>

                      </td>

                      <td style={styles.actionsCell}>

                        <div style={styles.actionGroup}>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(quiz)
                            }
                            style={styles.editButton}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                quiz.id
                              )
                            }
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handlePublish(quiz)
                            }
                            style={
                              isPublished
                                ? styles.unpublishButton
                                : styles.publishButton
                            }
                          >
                            {isPublished
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showForm && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  {editingQuiz
                    ? "Edit Quiz"
                    : "Create Quiz"}
                </h2>

                <p style={styles.modalSubtitle}>
                  {editingQuiz
                    ? "Update the quiz information."
                    : "Add a new quiz to the platform."}
                </p>

              </div>

              <button
                type="button"
                onClick={handleCancel}
                style={styles.closeButton}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* TITLE */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Quiz Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter quiz title"
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
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter quiz description"
                  rows={4}
                  style={styles.textarea}
                  disabled={saving}
                  required
                />

              </div>

              {/* CATEGORY */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={saving}
                  required
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DIFFICULTY */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Difficulty
                </label>

                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={saving}
                >

                  <option value="Easy">
                    Easy
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Hard">
                    Hard
                  </option>

                </select>

              </div>

              {/* TWO COLUMN */}

              <div style={styles.twoColumns}>

                {/* DURATION */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Duration (minutes)
                  </label>

                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="30"
                    min="1"
                    style={styles.input}
                    disabled={saving}
                    required
                  />

                </div>

                {/* PASSING */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Passing Percentage (%)
                  </label>

                  <input
                    type="number"
                    name="passing_percentage"
                    value={
                      formData.passing_percentage
                    }
                    onChange={handleChange}
                    placeholder="40"
                    min="0"
                    max="100"
                    style={styles.input}
                    disabled={saving}
                    required
                  />

                </div>

              </div>

              {/* MAX ATTEMPTS */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Maximum Attempts
                </label>

                <input
                  type="number"
                  name="max_attempts"
                  value={formData.max_attempts}
                  onChange={handleChange}
                  placeholder="3"
                  min="1"
                  style={styles.input}
                  disabled={saving}
                  required
                />

              </div>

              {/* STATUS */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={saving}
                >

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>

                  <option value="Unpublished">
                    Unpublished
                  </option>

                </select>

              </div>

              {/* BUTTONS */}

              <div style={styles.formButtons}>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.saveButton,
                    ...(saving
                      ? styles.disabledButton
                      : {}),
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingQuiz
                    ? "Update Quiz"
                    : "Create Quiz"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

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
    color: "#1f2937",
    fontSize: "32px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },

  createButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },

  errorBox: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b91c1c",
    padding: "14px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  tableHeader: {
    padding: "22px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    borderBottom: "1px solid #e5e7eb",
  },

  sectionTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "20px",
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  countBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
  },

  th: {
    backgroundColor: "#f8fafc",
    padding: "14px",
    textAlign: "left",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "bold",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  idBadge: {
    display: "inline-block",
    minWidth: "25px",
    padding: "5px 8px",
    textAlign: "center",
    borderRadius: "6px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    fontSize: "12px",
    fontWeight: "bold",
  },

  quizTitle: {
    color: "#1f2937",
  },

  description: {
    color: "#6b7280",
  },

  actionsCell: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  actionGroup: {
    display: "flex",
    gap: "6px",
  },

  editButton: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  publishButton: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  unpublishButton: {
    backgroundColor: "#fff7ed",
    color: "#ea580c",
    border: "1px solid #fed7aa",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  publishedBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  draftBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  unpublishedBadge: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  easyBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  mediumBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  hardBadge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  emptyBox: {
    padding: "60px 30px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  emptyTitle: {
    margin: 0,
    color: "#374151",
    fontSize: "18px",
  },

  emptyText: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },

  loadingBox: {
    backgroundColor: "#ffffff",
    maxWidth: "450px",
    margin: "100px auto",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
  },

  loadingTitle: {
    color: "#1f2937",
    marginBottom: "5px",
  },

  loadingText: {
    color: "#6b7280",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 2000,
    overflowY: "auto",
  },

  modal: {
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    boxSizing: "border-box",
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  modalTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "24px",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  closeButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#6b7280",
    fontSize: "30px",
    lineHeight: 1,
    cursor: "pointer",
  },

  formGroup: {
    marginBottom: "18px",
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "15px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    resize: "vertical",
    outline: "none",
  },

  formButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
  },

  cancelButton: {
    padding: "11px 20px",
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  saveButton: {
    padding: "11px 20px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default QuizManagement;