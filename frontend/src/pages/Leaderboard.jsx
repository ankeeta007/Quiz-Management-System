import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Leaderboard() {
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
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
          "https://quiz-management-system-o5i7.onrender.com/api/dashboard/api/leaderboard/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        console.log(
          "LEADERBOARD RESPONSE:",
          JSON.stringify(data, null, 2)
        );

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.error ||
              "Failed to fetch leaderboard."
          );
        }

        /*
          Backend normally returns:

          [
            {
              student_id: 2,
              username: "student1",
              best_score: 6,
              best_percentage: 100,
              average_percentage: 100,
              quiz_title: "Python Basics - 2",
              rank: 1
            }
          ]

          Also safely handle:
          { results: [...] }
          { leaderboard: [...] }
        */

        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else if (Array.isArray(data.results)) {
          setLeaderboard(data.results);
        } else if (Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Leaderboard error:", err);

        setError(
          err.message || "Failed to fetch leaderboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>

          <h1 style={styles.title}>
            Leaderboard
          </h1>

          <div style={styles.loadingCard}>
            <p style={styles.loadingText}>
              Loading leaderboard...
            </p>
          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* =========================
            HEADER
        ========================= */}

        <div style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Leaderboard
            </h1>

            <p style={styles.subtitle}>
              See the top performing students.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/student/dashboard")
            }
            style={styles.backButton}
          >
            Back to Dashboard
          </button>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* =========================
            EMPTY
        ========================= */}

        {!error && leaderboard.length === 0 && (
          <div style={styles.emptyCard}>

            <h3 style={styles.emptyTitle}>
              No leaderboard data available
            </h3>

            <p style={styles.emptyText}>
              Students need to complete quizzes
              before leaderboard data appears.
            </p>

          </div>
        )}

        {/* =========================
            LEADERBOARD TABLE
        ========================= */}

        {!error && leaderboard.length > 0 && (
          <div style={styles.tableCard}>

            {/* TABLE HEADER */}

            <div style={styles.tableTop}>

              <h2 style={styles.sectionTitle}>
                Top Performing Students
              </h2>

              <span style={styles.countBadge}>
                {leaderboard.length} Students
              </span>

            </div>

            {/* TABLE */}

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr>

                    <th style={styles.tableHeader}>
                      Rank
                    </th>

                    <th style={styles.tableHeader}>
                      Student
                    </th>

                    <th style={styles.tableHeader}>
                      Quiz
                    </th>

                    <th style={styles.tableHeader}>
                      Best Score
                    </th>

                    <th style={styles.tableHeader}>
                      Best Percentage
                    </th>

                    <th style={styles.tableHeader}>
                      Average Percentage
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {leaderboard.map(
                    (student, index) => {

                      const rank =
                        student.rank || index + 1;

                      const bestPercentage =
                        Number(
                          student.best_percentage ?? 0
                        );

                      const averagePercentage =
                        Number(
                          student.average_percentage ?? 0
                        );

                      return (
                        <tr
                          key={
                            student.student_id ||
                            index
                          }
                          style={styles.tableRow}
                        >

                          {/* =====================
                              RANK
                          ===================== */}

                          <td style={styles.tableCell}>

                            {rank === 1 ? (
                              <span
                                style={
                                  styles.firstRank
                                }
                              >
                                #1
                              </span>
                            ) : rank === 2 ? (
                              <span
                                style={
                                  styles.secondRank
                                }
                              >
                                #2
                              </span>
                            ) : rank === 3 ? (
                              <span
                                style={
                                  styles.thirdRank
                                }
                              >
                                #3
                              </span>
                            ) : (
                              <span
                                style={
                                  styles.normalRank
                                }
                              >
                                #{rank}
                              </span>
                            )}

                          </td>

                          {/* =====================
                              STUDENT
                          ===================== */}

                          <td style={styles.tableCell}>
                            <strong>
                              {student.username || "-"}
                            </strong>
                          </td>

                          {/* =====================
                              QUIZ
                          ===================== */}

                          <td style={styles.tableCell}>
                            {student.quiz_title || "-"}
                          </td>

                          {/* =====================
                              BEST SCORE
                          ===================== */}

                          <td style={styles.tableCell}>
                            {student.best_score ?? 0}
                          </td>

                          {/* =====================
                              BEST PERCENTAGE
                          ===================== */}

                          <td style={styles.tableCell}>

                            <span
                              style={
                                styles.percentageBadge
                              }
                            >
                              {bestPercentage.toFixed(2)}%
                            </span>

                          </td>

                          {/* =====================
                              AVERAGE
                          ===================== */}

                          <td style={styles.tableCell}>
                            {averagePercentage.toFixed(2)}%
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

        {/* =========================
            NAVIGATION
        ========================= */}

        <div style={styles.navigation}>

          <button
            onClick={() =>
              navigate("/student/dashboard")
            }
            style={styles.primaryButton}
          >
            Back to Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/student/quiz")
            }
            style={styles.secondaryButton}
          >
            Take Quiz
          </button>

          <button
            onClick={() =>
              navigate("/student/history")
            }
            style={styles.secondaryButton}
          >
            Quiz History
          </button>

        </div>

      </div>
    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

  /* =========================
     PAGE
  ========================= */

  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "40px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: "32px",
    color: "#1f2937",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  /* =========================
     TABLE CARD
  ========================= */

  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "25px",
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 3px 12px rgba(0, 0, 0, 0.08)",
  },

  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#1f2937",
  },

  countBadge: {
    backgroundColor: "#e8f0fe",
    color: "#2563eb",
    padding: "7px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "14px",
  },

  /* =========================
     TABLE
  ========================= */

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "850px",
    borderCollapse: "collapse",
  },

  tableHeader: {
    border: "1px solid #d1d5db",
    padding: "13px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    textAlign: "left",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  tableCell: {
    border: "1px solid #e5e7eb",
    padding: "14px",
    color: "#374151",
    whiteSpace: "nowrap",
  },

  tableRow: {
    backgroundColor: "#ffffff",
  },

  /* =========================
     RANK STYLES
  ========================= */

  firstRank: {
    display: "inline-block",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  secondRank: {
    display: "inline-block",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  thirdRank: {
    display: "inline-block",
    backgroundColor: "#fed7aa",
    color: "#9a3412",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  normalRank: {
    fontWeight: "bold",
    color: "#374151",
  },

  /* =========================
     PERCENTAGE
  ========================= */

  percentageBadge: {
    display: "inline-block",
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  /* =========================
     BUTTONS
  ========================= */

  backButton: {
    padding: "11px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "14px",
  },

  navigation: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "25px",
  },

  primaryButton: {
    padding: "11px 20px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
  },

  secondaryButton: {
    padding: "11px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "14px",
  },

  /* =========================
     ERROR
  ========================= */

  errorBox: {
    backgroundColor: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  /* =========================
     LOADING
  ========================= */

  loadingCard: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 3px 12px rgba(0, 0, 0, 0.06)",
  },

  loadingText: {
    margin: 0,
    color: "#6b7280",
  },

  /* =========================
     EMPTY
  ========================= */

  emptyCard: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    boxShadow:
      "0 3px 12px rgba(0, 0, 0, 0.06)",
  },

  emptyTitle: {
    marginTop: 0,
    color: "#374151",
  },

  emptyText: {
    color: "#6b7280",
  },
};

export default Leaderboard;