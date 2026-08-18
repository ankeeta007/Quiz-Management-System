import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function StudentReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReview = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/attempts/${attemptId}/review/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("REVIEW RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load answer review."
          );
        }

        setReviewData(data);
      } catch (error) {
        console.error("Review error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [attemptId]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Answer Review</h1>
          <p style={styles.loading}>Loading review...</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Answer Review</h1>

          <div style={styles.error}>
            {error}
          </div>

          <button
            onClick={() => navigate("/student/history")}
            style={styles.primaryButton}
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // NO RESULT
  // =========================

  if (!reviewData) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Answer Review</h1>

          <p>No review data found.</p>

          <button
            onClick={() => navigate("/student/history")}
            style={styles.primaryButton}
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const review = reviewData.review || [];

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <h1 style={styles.title}>
            Answer Review
          </h1>

          <h2 style={styles.quizTitle}>
            {reviewData.quiz_title}
          </h2>

          <p style={styles.subtitle}>
            Review your answers, correct answers and explanations.
          </p>
        </div>

        {/* QUESTIONS */}

        {review.length > 0 ? (
          review.map((item, index) => {
            const isUnanswered = !item.selected_option;
            const isCorrect = item.is_correct === true;

            return (
              <div
                key={item.question_id}
                style={styles.questionCard}
              >

                {/* QUESTION HEADER */}

                <div style={styles.questionHeader}>
                  <h3 style={styles.questionNumber}>
                    Question {index + 1}
                  </h3>

                  <span
                    style={
                      isUnanswered
                        ? styles.unansweredBadge
                        : isCorrect
                        ? styles.correctBadge
                        : styles.incorrectBadge
                    }
                  >
                    {isUnanswered
                      ? "Not Answered"
                      : isCorrect
                      ? "Correct"
                      : "Incorrect"}
                  </span>
                </div>

                {/* QUESTION */}

                <p style={styles.question}>
                  {item.question}
                </p>

                {/* YOUR ANSWER */}

                <div style={styles.answerBox}>
                  <strong>Your Answer</strong>

                  <p
                    style={
                      isUnanswered
                        ? styles.noAnswer
                        : isCorrect
                        ? styles.correctText
                        : styles.incorrectText
                    }
                  >
                    {item.selected_option ||
                      "Not Answered"}
                  </p>
                </div>

                {/* CORRECT ANSWER */}

                <div style={styles.correctAnswerBox}>
                  <strong>Correct Answer</strong>

                  <p style={styles.correctText}>
                    {item.correct_option ||
                      "Not Available"}
                  </p>
                </div>

                {/* MARKS */}

                <div style={styles.marksBox}>
                  <strong>Marks:</strong>{" "}
                  {item.marks}
                </div>

                {/* EXPLANATION */}

                <div style={styles.explanationBox}>
                  <strong>Explanation</strong>

                  <p style={styles.explanationText}>
                    {item.explanation ||
                      "No explanation available."}
                  </p>
                </div>

              </div>
            );
          })
        ) : (
          <div style={styles.empty}>
            <h3>No answer review available.</h3>

            <p>
              There are no answers to display for this attempt.
            </p>
          </div>
        )}

        {/* BUTTONS */}

        <div style={styles.buttons}>

          <button
            onClick={() =>
              navigate(
                `/student/result/${reviewData.attempt_id}`
              )
            }
            style={styles.primaryButton}
          >
            Back to Result
          </button>

          <button
            onClick={() =>
              navigate("/student/history")
            }
            style={styles.secondaryButton}
          >
            Back to History
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
  );
}


// =========================
// STYLES
// =========================

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

  quizTitle: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    color: "#2563eb",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "15px",
  },

  loading: {
    fontSize: "18px",
    color: "#666",
  },

  questionCard: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "20px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },

  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },

  questionNumber: {
    margin: 0,
    fontSize: "18px",
    color: "#374151",
  },

  question: {
    fontSize: "17px",
    fontWeight: "500",
    lineHeight: "1.6",
    color: "#111827",
    marginBottom: "20px",
  },

  correctBadge: {
    color: "#15803d",
    backgroundColor: "#dcfce7",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  incorrectBadge: {
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  unansweredBadge: {
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  answerBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "12px",
  },

  correctAnswerBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "12px",
  },

  correctText: {
    color: "#15803d",
    fontWeight: "500",
    margin: "8px 0 0 0",
  },

  incorrectText: {
    color: "#dc2626",
    fontWeight: "500",
    margin: "8px 0 0 0",
  },

  noAnswer: {
    color: "#6b7280",
    fontStyle: "italic",
    margin: "8px 0 0 0",
  },

  marksBox: {
    padding: "12px 15px",
    borderTop: "1px solid #e5e7eb",
    color: "#374151",
    marginTop: "10px",
  },

  explanationBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "15px",
    color: "#374151",
  },

  explanationText: {
    margin: "8px 0 0 0",
    lineHeight: "1.5",
  },

  empty: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "30px",
    border: "1px solid #ddd",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "25px",
    marginBottom: "30px",
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

export default StudentReview;