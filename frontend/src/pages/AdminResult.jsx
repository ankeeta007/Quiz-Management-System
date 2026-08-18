import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AdminResult() {
  const navigate = useNavigate();
  const { attemptId } = useParams();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ADMIN ATTEMPT RESULT
  // =====================================================

  useEffect(() => {
    const fetchAttempt = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      if (!attemptId) {
        setError("Attempt ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/api/admin/attempts/${attemptId}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("ADMIN RESULT RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.detail ||
              "Failed to fetch result."
          );
        }

        setAttempt(data);
      } catch (err) {
        console.error("Admin result error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.messageCard}>
            <h2 style={styles.messageTitle}>
              Loading result...
            </h2>

            <p style={styles.messageText}>
              Please wait while the student result is loading.
            </p>
          </div>
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
        <div style={styles.container}>

          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                Student Result
              </h1>

              <p style={styles.subtitle}>
                View detailed quiz attempt information.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/attempts")
              }
              style={styles.backButton}
            >
              Back to Student Attempts
            </button>
          </div>

          <div style={styles.messageCard}>
            <h2 style={styles.errorTitle}>
              Failed to load result
            </h2>

            <p style={styles.messageText}>
              {error}
            </p>

            <button
              onClick={() =>
                navigate("/admin/attempts")
              }
              style={styles.primaryButton}
            >
              Go to Student Attempts
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // NO RESULT
  // =====================================================

  if (!attempt) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>

          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                Student Result
              </h1>

              <p style={styles.subtitle}>
                View detailed quiz attempt information.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/attempts")
              }
              style={styles.backButton}
            >
              Back to Student Attempts
            </button>
          </div>

          <div style={styles.messageCard}>
            <h2 style={styles.messageTitle}>
              No result data found
            </h2>

            <p style={styles.messageText}>
              The requested student attempt could not be found.
            </p>

            <button
              onClick={() =>
                navigate("/admin/attempts")
              }
              style={styles.primaryButton}
            >
              Go to Student Attempts
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // RESULT DATA
  // =====================================================

  const percentage = Number(
    attempt.percentage || 0
  );

  const isPassed =
    attempt.status === "PASSED";

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Student Result
            </h1>

            <p style={styles.subtitle}>
              Detailed information about the student's quiz attempt.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/admin/attempts")
            }
            style={styles.backButton}
          >
            Back to Student Attempts
          </button>

        </div>

        {/* =================================================
            RESULT CARD
        ================================================= */}

        <div style={styles.resultCard}>

          {/* =================================================
              RESULT HEADER
          ================================================= */}

          <div style={styles.resultHeader}>

            <div>

              <h2 style={styles.quizTitle}>
                {attempt.quiz_title || "Quiz"}
              </h2>

              <p style={styles.studentName}>
                Student:{" "}
                <strong>
                  {attempt.student_username || "-"}
                </strong>
              </p>

            </div>

            <span
              style={
                isPassed
                  ? styles.passedLarge
                  : styles.failedLarge
              }
            >
              {attempt.status || "FAILED"}
            </span>

          </div>

          {/* =================================================
              SCORE
          ================================================= */}

          <div style={styles.scoreSection}>

            <div style={styles.scoreBox}>

              <span style={styles.scoreLabel}>
                Score
              </span>

              <strong style={styles.scoreValue}>
                {attempt.score ?? 0}
              </strong>

            </div>

            <div style={styles.scoreBox}>

              <span style={styles.scoreLabel}>
                Percentage
              </span>

              <strong style={styles.scoreValue}>
                {percentage.toFixed(2)}%
              </strong>

            </div>

          </div>

          {/* =================================================
              PERFORMANCE
          ================================================= */}

          <h3 style={styles.sectionTitle}>
            Performance
          </h3>

          <div style={styles.statsGrid}>

            {/* CORRECT */}

            <div style={styles.statCard}>

              <span style={styles.statLabel}>
                Correct Answers
              </span>

              <strong style={styles.correctValue}>
                {attempt.correct_answers ?? 0}
              </strong>

            </div>

            {/* INCORRECT */}

            <div style={styles.statCard}>

              <span style={styles.statLabel}>
                Incorrect Answers
              </span>

              <strong style={styles.incorrectValue}>
                {attempt.incorrect_answers ?? 0}
              </strong>

            </div>

            {/* UNANSWERED */}

            <div style={styles.statCard}>

              <span style={styles.statLabel}>
                Unanswered
              </span>

              <strong style={styles.unansweredValue}>
                {attempt.unanswered ?? 0}
              </strong>

            </div>

            {/* TIME */}

            <div style={styles.statCard}>

              <span style={styles.statLabel}>
                Time Taken
              </span>

              <strong style={styles.timeValue}>
                {attempt.time_taken != null
                  ? `${attempt.time_taken} sec`
                  : "-"}
              </strong>

            </div>

          </div>

          {/* =================================================
              ATTEMPT INFORMATION
          ================================================= */}

          <h3 style={styles.sectionTitle}>
            Attempt Information
          </h3>

          <div style={styles.infoCard}>

            {/* ATTEMPT ID */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Attempt ID
              </span>

              <span style={styles.infoValue}>
                {attempt.attempt_id || "-"}
              </span>

            </div>

            {/* STUDENT ID */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Student ID
              </span>

              <span style={styles.infoValue}>
                {attempt.student_id || "-"}
              </span>

            </div>

            {/* STUDENT */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Student
              </span>

              <span style={styles.infoValue}>
                {attempt.student_username || "-"}
              </span>

            </div>

            {/* STUDENT EMAIL */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Student Email
              </span>

              <span style={styles.infoValue}>
                {attempt.student_email || "-"}
              </span>

            </div>

            {/* QUIZ */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Quiz
              </span>

              <span style={styles.infoValue}>
                {attempt.quiz_title || "-"}
              </span>

            </div>

            {/* QUIZ ID */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Quiz ID
              </span>

              <span style={styles.infoValue}>
                {attempt.quiz_id || "-"}
              </span>

            </div>

            {/* STATUS */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Status
              </span>

              <span
                style={
                  isPassed
                    ? styles.passedSmall
                    : styles.failedSmall
                }
              >
                {attempt.status || "FAILED"}
              </span>

            </div>

            {/* STARTED AT */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Started At
              </span>

              <span style={styles.infoValue}>
                {attempt.started_at
                  ? new Date(
                      attempt.started_at
                    ).toLocaleString()
                  : "N/A"}
              </span>

            </div>

            {/* COMPLETED AT */}

            <div style={styles.infoRow}>

              <span style={styles.infoLabel}>
                Completed At
              </span>

              <span style={styles.infoValue}>
                {attempt.completed_at
                  ? new Date(
                      attempt.completed_at
                    ).toLocaleString()
                  : "N/A"}
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            BOTTOM BUTTON
        ================================================= */}

        <div style={styles.bottomActions}>

          <button
            onClick={() =>
              navigate("/admin/attempts")
            }
            style={styles.primaryButton}
          >
            Back to Student Attempts
          </button>

        </div>

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

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
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
    margin: "0 0 8px 0",
    fontSize: "32px",
    color: "#1f2937",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow:
      "0 3px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e7eb",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    paddingBottom: "25px",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },

  quizTitle: {
    margin: "0 0 8px 0",
    fontSize: "25px",
    color: "#1f2937",
  },

  studentName: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  scoreSection: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginTop: "25px",
    marginBottom: "35px",
  },

  scoreBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "25px",
    textAlign: "center",
  },

  scoreLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "15px",
    marginBottom: "10px",
  },

  scoreValue: {
    display: "block",
    color: "#2563eb",
    fontSize: "30px",
  },

  sectionTitle: {
    margin: "0 0 18px 0",
    fontSize: "21px",
    color: "#1f2937",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "35px",
  },

  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
  },

  statLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "10px",
  },

  correctValue: {
    fontSize: "25px",
    color: "#16a34a",
  },

  incorrectValue: {
    fontSize: "25px",
    color: "#dc2626",
  },

  unansweredValue: {
    fontSize: "25px",
    color: "#d97706",
  },

  timeValue: {
    fontSize: "25px",
    color: "#2563eb",
  },

  infoCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },

  infoLabel: {
    fontWeight: "bold",
    color: "#374151",
  },

  infoValue: {
    color: "#6b7280",
    textAlign: "right",
    wordBreak: "break-word",
  },

  passedLarge: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "10px 18px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  failedLarge: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    padding: "10px 18px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  passedSmall: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "5px 12px",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  failedSmall: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    padding: "5px 12px",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  backButton: {
    padding: "11px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "14px",
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

  bottomActions: {
    marginTop: "25px",
  },

  messageCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "35px",
    boxShadow:
      "0 3px 12px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
  },

  messageTitle: {
    marginTop: 0,
    color: "#1f2937",
  },

  errorTitle: {
    marginTop: 0,
    color: "#dc2626",
  },

  messageText: {
    color: "#6b7280",
    marginBottom: "20px",
  },
};

export default AdminResult;