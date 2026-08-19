import { useEffect, useState } from "react";

function AdminDashboard() {
  const API_URL = "https://quiz-management-system-o5i7.onrender.com/api";

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =====================================================
  // SAFE RESPONSE
  // =====================================================

  const getResponseData = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        error: `Server returned an invalid response (${response.status}).`,
      };
    }
  };

  // =====================================================
  // FETCH ADMIN ANALYTICS
  // =====================================================

  const fetchAnalytics = async () => {
    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // IMPORTANT:
      // Backend URL is:
      // /api/dashboard/admin/analytics/

      const response = await fetch(
        `${API_URL}/dashboard/admin/analytics/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getResponseData(response);

      console.log("ADMIN ANALYTICS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to fetch dashboard analytics."
        );
      }

      setAnalytics(data);
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toLocaleString();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <h2>Admin Dashboard</h2>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            onClick={fetchAnalytics}
            style={styles.primaryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // SAFETY
  // =====================================================

  if (!analytics) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyBox}>
          <h2>No dashboard data</h2>

          <button
            onClick={fetchAnalytics}
            style={styles.primaryButton}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const students = analytics.students || {};
  const quizzes = analytics.quizzes || {};
  const questions = analytics.questions || {};
  const attempts = analytics.attempts || {};
  const performance =
    analytics.performance || {};

  const popularQuizzes =
    Array.isArray(analytics.popular_quizzes)
      ? analytics.popular_quizzes
      : [];

  const categories =
    Array.isArray(analytics.categories)
      ? analytics.categories
      : [];

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
            Admin Dashboard
          </h1>

          <p style={styles.subtitle}>
            Overview of quiz management and
            student performance
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          style={styles.refreshButton}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =================================================
          MAIN STATISTICS
      ================================================= */}

      <h2 style={styles.sectionTitle}>
        Overview
      </h2>

      <div style={styles.statsGrid}>

        {/* STUDENTS */}

        <div style={styles.statCard}>
          <div>

            <span style={styles.statLabel}>
              Total Students
            </span>

            <strong style={styles.statNumber}>
              {formatNumber(
                students.total_students
              )}
            </strong>

            <span style={styles.statSubtext}>
              {formatNumber(
                students.active_students
              )}{" "}
              active students
            </span>

          </div>

          <div style={styles.iconBox}>
            👥
          </div>
        </div>

        {/* QUIZZES */}

        <div style={styles.statCard}>
          <div>

            <span style={styles.statLabel}>
              Total Quizzes
            </span>

            <strong style={styles.statNumber}>
              {formatNumber(
                quizzes.total_quizzes
              )}
            </strong>

            <span style={styles.statSubtext}>
              {formatNumber(
                quizzes.published_quizzes
              )}{" "}
              published
            </span>

          </div>

          <div style={styles.iconBox}>
            📝
          </div>
        </div>

        {/* QUESTIONS */}

        <div style={styles.statCard}>
          <div>

            <span style={styles.statLabel}>
              Total Questions
            </span>

            <strong style={styles.statNumber}>
              {formatNumber(
                questions.total_questions
              )}
            </strong>

            <span style={styles.statSubtext}>
              Easy:{" "}
              {formatNumber(
                questions.easy_questions
              )}
            </span>

          </div>

          <div style={styles.iconBox}>
            ❓
          </div>
        </div>

        {/* ATTEMPTS */}

        <div style={styles.statCard}>
          <div>

            <span style={styles.statLabel}>
              Total Attempts
            </span>

            <strong style={styles.statNumber}>
              {formatNumber(
                attempts.total_attempts
              )}
            </strong>

            <span style={styles.statSubtext}>
              {formatNumber(
                attempts.passed_attempts
              )}{" "}
              passed
            </span>

          </div>

          <div style={styles.iconBox}>
            📊
          </div>
        </div>

      </div>

      {/* =================================================
          QUIZ STATUS
      ================================================= */}

      <h2 style={styles.sectionTitle}>
        Quiz Status
      </h2>

      <div style={styles.statusGrid}>

        <div style={styles.statusCard}>
          <span style={styles.statusNumber}>
            {formatNumber(
              quizzes.published_quizzes
            )}
          </span>

          <span style={styles.statusLabel}>
            Published
          </span>
        </div>

        <div style={styles.statusCard}>
          <span style={styles.statusNumber}>
            {formatNumber(
              quizzes.draft_quizzes
            )}
          </span>

          <span style={styles.statusLabel}>
            Draft
          </span>
        </div>

        <div style={styles.statusCard}>
          <span style={styles.statusNumber}>
            {formatNumber(
              quizzes.unpublished_quizzes
            )}
          </span>

          <span style={styles.statusLabel}>
            Unpublished
          </span>
        </div>

      </div>

      {/* =================================================
          PERFORMANCE
      ================================================= */}

      <h2 style={styles.sectionTitle}>
        Performance
      </h2>

      <div style={styles.performanceGrid}>

        <div style={styles.performanceCard}>

          <span style={styles.performanceLabel}>
            Average Score
          </span>

          <strong style={styles.performanceValue}>
            {Number(
              performance.average_score || 0
            ).toFixed(2)}
          </strong>

        </div>

        <div style={styles.performanceCard}>

          <span style={styles.performanceLabel}>
            Average Percentage
          </span>

          <strong style={styles.performanceValue}>
            {Number(
              performance.average_percentage || 0
            ).toFixed(2)}
            %
          </strong>

        </div>

        <div style={styles.performanceCard}>

          <span style={styles.performanceLabel}>
            Highest Percentage
          </span>

          <strong style={styles.performanceValue}>
            {Number(
              performance.highest_percentage || 0
            ).toFixed(2)}
            %
          </strong>

        </div>

        <div style={styles.performanceCard}>

          <span style={styles.performanceLabel}>
            Pass Rate
          </span>

          <strong style={styles.performanceValue}>
            {Number(
              attempts.pass_rate || 0
            ).toFixed(2)}
            %
          </strong>

        </div>

      </div>

      {/* =================================================
          QUESTION DIFFICULTY
      ================================================= */}

      <h2 style={styles.sectionTitle}>
        Question Difficulty
      </h2>

      <div style={styles.difficultyGrid}>

        <div style={styles.difficultyCard}>

          <span style={styles.difficultyTitle}>
            Easy
          </span>

          <strong style={styles.difficultyNumber}>
            {formatNumber(
              questions.easy_questions
            )}
          </strong>

        </div>

        <div style={styles.difficultyCard}>

          <span style={styles.difficultyTitle}>
            Medium
          </span>

          <strong style={styles.difficultyNumber}>
            {formatNumber(
              questions.medium_questions
            )}
          </strong>

        </div>

        <div style={styles.difficultyCard}>

          <span style={styles.difficultyTitle}>
            Hard
          </span>

          <strong style={styles.difficultyNumber}>
            {formatNumber(
              questions.hard_questions
            )}
          </strong>

        </div>

      </div>

      {/* =================================================
          POPULAR QUIZZES
      ================================================= */}

      <h2 style={styles.sectionTitle}>
        Popular Quizzes
      </h2>

      {popularQuizzes.length === 0 ? (

        <div style={styles.emptySection}>
          <p>
            No quiz attempt data available.
          </p>
        </div>

      ) : (

        <div style={styles.tableContainer}>

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Rank
                  </th>

                  <th style={styles.th}>
                    Quiz
                  </th>

                  <th style={styles.th}>
                    Category
                  </th>

                  <th style={styles.th}>
                    Attempts
                  </th>

                </tr>

              </thead>

              <tbody>

                {popularQuizzes.map(
                  (quiz, index) => (

                    <tr
                      key={
                        quiz.quiz_id ||
                        index
                      }
                    >

                      <td style={styles.td}>
                        #{index + 1}
                      </td>

                      <td style={styles.td}>
                        <strong>
                          {quiz.quiz_title ||
                            "-"}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        {quiz.category ||
                          "-"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            styles.attemptBadge
                          }
                        >
                          {formatNumber(
                            quiz.attempt_count
                          )}
                        </span>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* =================================================
          CATEGORY STATISTICS
      ================================================= */}

      <h2 style={styles.sectionTitle}>
        Category Statistics
      </h2>

      {categories.length === 0 ? (

        <div style={styles.emptySection}>
          <p>
            No category data available.
          </p>
        </div>

      ) : (

        <div style={styles.categoryGrid}>

          {categories.map(
            (category) => (

              <div
                key={
                  category.category_id
                }
                style={
                  styles.categoryCard
                }
              >

                <h3
                  style={
                    styles.categoryName
                  }
                >
                  {category.category_name ||
                    "-"}
                </h3>

                <div
                  style={
                    styles.categoryStats
                  }
                >

                  <div>

                    <span
                      style={
                        styles.categoryLabel
                      }
                    >
                      Quizzes
                    </span>

                    <strong>
                      {formatNumber(
                        category.quiz_count
                      )}
                    </strong>

                  </div>

                  <div>

                    <span
                      style={
                        styles.categoryLabel
                      }
                    >
                      Attempts
                    </span>

                    <strong>
                      {formatNumber(
                        category.attempt_count
                      )}
                    </strong>

                  </div>

                </div>

              </div>

            )
          )}

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
    marginBottom: "35px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#6b7280",
    fontSize: "15px",
  },

  refreshButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: "21px",
    color: "#1f2937",
    marginTop: "30px",
    marginBottom: "18px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "20px",
  },

  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  statLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px",
  },

  statNumber: {
    display: "block",
    color: "#2563eb",
    fontSize: "28px",
    fontWeight: "bold",
  },

  statSubtext: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginTop: "6px",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "20px",
  },

  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusNumber: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  statusLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },

  performanceGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "20px",
  },

  performanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "25px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  performanceLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "12px",
  },

  performanceValue: {
    display: "block",
    color: "#2563eb",
    fontSize: "27px",
  },

  difficultyGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "20px",
  },

  difficultyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  difficultyTitle: {
    color: "#6b7280",
    fontSize: "15px",
  },

  difficultyNumber: {
    color: "#2563eb",
    fontSize: "26px",
  },

  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "650px",
  },

  th: {
    backgroundColor: "#f8fafc",
    padding: "15px",
    textAlign: "left",
    fontSize: "13px",
    color: "#374151",
    borderBottom:
      "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px",
    fontSize: "14px",
    color: "#4b5563",
    borderBottom:
      "1px solid #e5e7eb",
  },

  attemptBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "5px 10px",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "12px",
  },

  categoryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "20px",
    paddingBottom: "40px",
  },

  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  categoryName: {
    margin: "0 0 18px 0",
    color: "#1f2937",
    fontSize: "17px",
  },

  categoryStats: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },

  categoryLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "5px",
  },

  emptySection: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
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

  errorBox: {
    backgroundColor: "#ffffff",
    maxWidth: "600px",
    margin: "80px auto",
    padding: "35px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    color: "#b91c1c",
  },

  emptyBox: {
    backgroundColor: "#ffffff",
    maxWidth: "600px",
    margin: "80px auto",
    padding: "35px",
    borderRadius: "12px",
    textAlign: "center",
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default AdminDashboard;