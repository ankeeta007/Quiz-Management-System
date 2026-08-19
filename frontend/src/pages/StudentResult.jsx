import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function StudentResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://quiz-management-system-o5i7.onrender.com/api/attempts/${attemptId}/result/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("RESULT RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load quiz result."
          );
        }

        setResult(data);
      } catch (error) {
        console.error("Result error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Quiz Result</h1>
          <p style={styles.loading}>Loading result...</p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Quiz Result</h1>

          <div style={styles.error}>
            {error}
          </div>

          <button
            onClick={() => navigate("/student/quiz")}
            style={styles.primaryButton}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     NO RESULT
  ========================= */

  if (!result) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>No Result Found</h1>

          <button
            onClick={() => navigate("/student/quiz")}
            style={styles.primaryButton}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const percentage = Number(result.percentage || 0);

  const isPassed = result.status === "PASSED";

  /* =========================
     RESULT PAGE
  ========================= */

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <h1 style={styles.title}>
            Quiz Result
          </h1>

          <p style={styles.subtitle}>
            Here is your performance summary.
          </p>
        </div>

        {/* QUIZ CARD */}

        <div style={styles.resultCard}>

          <h2 style={styles.quizTitle}>
            {result.quiz_title}
          </h2>

          {/* STATUS */}

          <div
            style={
              isPassed
                ? styles.passed
                : styles.failed
            }
          >
            {result.status}
          </div>

          {/* PERCENTAGE */}

          <div style={styles.percentageBox}>

            <div style={styles.percentage}>
              {percentage.toFixed(2)}%
            </div>

            <div style={styles.percentageLabel}>
              Your Percentage
            </div>

          </div>

          {/* SCORE */}

          <div style={styles.scoreBox}>

            <div style={styles.scoreLabel}>
              Score
            </div>

            <div style={styles.score}>
              {result.score}
            </div>

          </div>

          {/* STATISTICS */}

          <div style={styles.stats}>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>
                Correct
              </span>

              <strong style={styles.correct}>
                {result.correct_answers}
              </strong>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>
                Incorrect
              </span>

              <strong style={styles.incorrect}>
                {result.incorrect_answers}
              </strong>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>
                Unanswered
              </span>

              <strong style={styles.unanswered}>
                {result.unanswered}
              </strong>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>
                Time Taken
              </span>

              <strong style={styles.time}>
                {result.time_taken} sec
              </strong>
            </div>

          </div>

          {/* DATE INFORMATION */}

          <div style={styles.dateSection}>

            <p>
              <strong>Started At:</strong>{" "}
              {result.started_at}
            </p>

            <p>
              <strong>Completed At:</strong>{" "}
              {result.completed_at}
            </p>

          </div>

          {/* BUTTONS */}

          <div style={styles.buttons}>

            <button
              onClick={() =>
                navigate(
                  `/student/review/${result.attempt_id}`
                )
              }
              style={styles.primaryButton}
            >
              View Answer Review
            </button>

            <button
              onClick={() =>
                navigate("/student/history")
              }
              style={styles.secondaryButton}
            >
              Quiz History
            </button>

            <button
              onClick={() =>
                navigate("/student/quiz")
              }
              style={styles.backButton}
            >
              Back to Quizzes
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================
   STYLES
========================= */

const styles = {

  page: {
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "30px",
  },

  title: {
    margin: "0 0 10px 0",
    fontSize: "32px",
    color: "#1f2937",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  loading: {
    fontSize: "18px",
    color: "#666",
  },

  resultCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "35px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },

  quizTitle: {
    margin: "0 0 15px 0",
    fontSize: "26px",
    color: "#111827",
  },

  passed: {
    display: "inline-block",
    color: "#15803d",
    fontWeight: "bold",
    padding: "7px 18px",
    backgroundColor: "#dcfce7",
    borderRadius: "20px",
    marginBottom: "25px",
  },

  failed: {
    display: "inline-block",
    color: "#dc2626",
    fontWeight: "bold",
    padding: "7px 18px",
    backgroundColor: "#fee2e2",
    borderRadius: "20px",
    marginBottom: "25px",
  },

  percentageBox: {
    textAlign: "center",
    padding: "25px",
    backgroundColor: "#eff6ff",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  percentage: {
    fontSize: "46px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  percentageLabel: {
    marginTop: "5px",
    color: "#6b7280",
  },

  scoreBox: {
    textAlign: "center",
    marginBottom: "30px",
  },

  scoreLabel: {
    color: "#6b7280",
    fontSize: "15px",
  },

  score: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "5px",
    color: "#111827",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },

  statCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "18px",
    textAlign: "center",
    backgroundColor: "#fafafa",
  },

  statLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px",
  },

  correct: {
    color: "#16a34a",
    fontSize: "24px",
  },

  incorrect: {
    color: "#dc2626",
    fontSize: "24px",
  },

  unanswered: {
    color: "#6b7280",
    fontSize: "24px",
  },

  time: {
    color: "#2563eb",
    fontSize: "20px",
  },

  dateSection: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
    color: "#6b7280",
    fontSize: "14px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "25px",
  },

  primaryButton: {
    padding: "11px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "500",
  },

  secondaryButton: {
    padding: "11px 20px",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "white",
    color: "#2563eb",
    fontWeight: "500",
  },

  backButton: {
    padding: "11px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "white",
    color: "#374151",
    fontWeight: "500",
  },

  error: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    padding: "14px",
    borderRadius: "7px",
    marginBottom: "20px",
  },
};

export default StudentResult;