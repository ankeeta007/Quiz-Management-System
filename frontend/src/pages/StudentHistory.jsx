import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD QUIZ HISTORY
  ===================================================== */

  useEffect(() => {
    const loadHistory = async () => {
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
          "https://quiz-management-system-o5i7.onrender.com/api/attempts/history/",
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
          "STUDENT HISTORY RESPONSE:",
          JSON.stringify(data, null, 2)
        );

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.detail ||
              "Failed to load quiz history."
          );
        }

        /*
          Backend may return:

          [
            {...},
            {...}
          ]

          OR

          {
            results: [...]
          }

          OR

          {
            history: [...]
          }
        */

        if (Array.isArray(data)) {
          setHistory(data);
        } else if (Array.isArray(data.results)) {
          setHistory(data.results);
        } else if (Array.isArray(data.history)) {
          setHistory(data.history);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Student history error:", error);

        setError(
          error.message ||
            "Something went wrong while loading quiz history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>

          <div style={styles.header}>
            <h1 style={styles.title}>
              Quiz History
            </h1>

            <p style={styles.subtitle}>
              View your previous quiz attempts and
              performance.
            </p>
          </div>

          <div style={styles.loadingCard}>
            <div style={styles.loadingText}>
              Loading quiz history...
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Quiz History
            </h1>

            <p style={styles.subtitle}>
              View your previous quiz attempts and
              performance.
            </p>
          </div>

          <div style={styles.countBox}>
            <strong style={styles.countNumber}>
              {history.length}
            </strong>

            <span style={styles.countText}>
              Attempts
            </span>
          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* =================================================
            EMPTY HISTORY
        ================================================= */}

        {!error && history.length === 0 && (
          <div style={styles.emptyCard}>

            <h2 style={styles.emptyTitle}>
              No completed quizzes found.
            </h2>

            <p style={styles.emptyText}>
              You have not completed any quizzes yet.
            </p>

            <button
              onClick={() =>
                navigate("/student/quiz")
              }
              style={styles.primaryButton}
            >
              Take a Quiz
            </button>

          </div>
        )}

        {/* =================================================
            HISTORY
        ================================================= */}

        {!error && history.length > 0 && (
          <div style={styles.historyContainer}>

            {history.map((attempt, index) => {

              const percentage = Number(
                attempt.percentage ?? 0
              );

              const score = attempt.score ?? 0;

              const correctAnswers =
                attempt.correct_answers ?? 0;

              const incorrectAnswers =
                attempt.incorrect_answers ?? 0;

              const unanswered =
                attempt.unanswered ?? 0;

              const timeTaken =
                attempt.time_taken;

              const isPassed =
                String(attempt.status || "").toUpperCase() ===
                "PASSED";

              const completedDate =
                attempt.completed_at
                  ? new Date(
                      attempt.completed_at
                    ).toLocaleString()
                  : "Not available";

              const attemptId =
                attempt.attempt_id ??
                attempt.id ??
                index;

              return (
                <div
                  key={attemptId}
                  style={styles.card}
                >

                  {/* =========================================
                      CARD HEADER
                  ========================================= */}

                  <div style={styles.cardHeader}>

                    <div>
                      <h2 style={styles.quizTitle}>
                        {attempt.quiz_title ||
                          attempt.quiz ||
                          "Quiz"}
                      </h2>

                      <p style={styles.attemptId}>
                        Attempt ID:{" "}
                        {attempt.attempt_id ??
                          attempt.id ??
                          "-"}
                      </p>
                    </div>

                    <span
                      style={
                        isPassed
                          ? styles.passed
                          : styles.failed
                      }
                    >
                      {attempt.status || "FAILED"}
                    </span>

                  </div>

                  {/* =========================================
                      PERFORMANCE STATS
                  ========================================= */}

                  <div style={styles.stats}>

                    {/* SCORE */}

                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>
                        Score
                      </span>

                      <strong style={styles.statValue}>
                        {score}
                      </strong>
                    </div>

                    {/* PERCENTAGE */}

                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>
                        Percentage
                      </span>

                      <strong
                        style={styles.statValue}
                      >
                        {percentage.toFixed(2)}%
                      </strong>
                    </div>

                    {/* CORRECT */}

                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>
                        Correct
                      </span>

                      <strong style={styles.statValue}>
                        {correctAnswers}
                      </strong>
                    </div>

                    {/* INCORRECT */}

                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>
                        Incorrect
                      </span>

                      <strong style={styles.statValue}>
                        {incorrectAnswers}
                      </strong>
                    </div>

                    {/* UNANSWERED */}

                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>
                        Unanswered
                      </span>

                      <strong style={styles.statValue}>
                        {unanswered}
                      </strong>
                    </div>

                    {/* TIME */}

                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>
                        Time Taken
                      </span>

                      <strong style={styles.statValue}>
                        {timeTaken != null
                          ? `${timeTaken} sec`
                          : "-"}
                      </strong>
                    </div>

                  </div>

                  {/* =========================================
                      COMPLETED DATE
                  ========================================= */}

                  <div style={styles.completedBox}>

                    <span style={styles.completedLabel}>
                      Completed:
                    </span>

                    <span style={styles.completedDate}>
                      {completedDate}
                    </span>

                  </div>

                  {/* =========================================
                      BUTTONS
                  ========================================= */}

                  <div style={styles.buttons}>

                    <button
                      onClick={() =>
                        navigate(
                          `/student/result/${attemptId}`
                        )
                      }
                      style={styles.primaryButton}
                    >
                      View Result
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/student/review/${attemptId}`
                        )
                      }
                      style={styles.secondaryButton}
                    >
                      Review Answers
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div style={styles.navigation}>

          <button
            onClick={() =>
              navigate("/student/dashboard")
            }
            style={styles.secondaryButton}
          >
            Back to Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/student/quiz")
            }
            style={styles.primaryButton}
          >
            Take a Quiz
          </button>

        </div>

      </div>
    </div>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = {

  page: {
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  /* =====================================================
     HEADER
  ===================================================== */

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
    color: "#111827",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  countBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  countNumber: {
    fontSize: "22px",
    color: "#2563eb",
  },

  countText: {
    color: "#6b7280",
    fontSize: "14px",
  },

  /* =====================================================
     LOADING
  ===================================================== */

  loadingCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "35px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  loadingText: {
    color: "#6b7280",
    fontSize: "16px",
  },

  /* =====================================================
     HISTORY
  ===================================================== */

  historyContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  quizTitle: {
    margin: "0 0 6px 0",
    fontSize: "22px",
    color: "#111827",
  },

  attemptId: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "13px",
  },

  /* =====================================================
     STATUS
  ===================================================== */

  passed: {
    display: "inline-block",
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "7px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  failed: {
    display: "inline-block",
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    padding: "7px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  /* =====================================================
     STATS
  ===================================================== */

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  statBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
  },

  statLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "13px",
    marginBottom: "8px",
  },

  statValue: {
    display: "block",
    color: "#2563eb",
    fontSize: "20px",
  },

  /* =====================================================
     COMPLETED
  ===================================================== */

  completedBox: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "5px",
    marginBottom: "20px",
  },

  completedLabel: {
    color: "#374151",
    fontWeight: "bold",
    fontSize: "14px",
  },

  completedDate: {
    color: "#6b7280",
    fontSize: "14px",
  },

  /* =====================================================
     BUTTONS
  ===================================================== */

  buttons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
  },

  navigation: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "25px",
  },

  primaryButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "14px",
  },

  secondaryButton: {
    padding: "10px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontWeight: "500",
    fontSize: "14px",
  },

  /* =====================================================
     ERROR
  ===================================================== */

  errorBox: {
    backgroundColor: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  /* =====================================================
     EMPTY
  ===================================================== */

  emptyCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  emptyTitle: {
    marginTop: 0,
    color: "#111827",
  },

  emptyText: {
    color: "#6b7280",
    marginBottom: "20px",
  },
};

export default StudentHistory;