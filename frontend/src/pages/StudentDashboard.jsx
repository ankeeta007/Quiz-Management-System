import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StudentDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD STUDENT DASHBOARD
  ===================================================== */

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/student/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("STUDENT DASHBOARD RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to load dashboard."
        );
      }

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.message || "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <h1 style={styles.title}>
            Student Dashboard
          </h1>

          <p style={styles.subtitle}>
            Loading dashboard...
          </p>
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

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Student Dashboard
            </h1>

            <p style={styles.subtitle}>
              Welcome to the Quiz Management & Online
              Assessment Platform.
            </p>
          </div>

          {/* LEADERBOARD BUTTON */}

          <button
            onClick={() =>
              navigate("/student/leaderboard")
            }
            style={styles.leaderboardButton}
          >
            Leaderboard
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* =================================================
            DASHBOARD DATA
        ================================================= */}

        {dashboard && (
          <>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <h2 style={styles.sectionTitle}>
              My Statistics
            </h2>

            <div style={styles.statsGrid}>

              {/* ATTEMPTED */}

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  Quizzes Attempted
                </h3>

                <p style={styles.number}>
                  {dashboard.total_quizzes_attempted ?? 0}
                </p>

                <p style={styles.cardDescription}>
                  Total quizzes attempted
                </p>
              </div>

              {/* PASSED */}

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  Quizzes Passed
                </h3>

                <p style={styles.number}>
                  {dashboard.total_quizzes_passed ?? 0}
                </p>

                <p style={styles.cardDescription}>
                  Successful attempts
                </p>
              </div>

              {/* FAILED */}

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  Quizzes Failed
                </h3>

                <p style={styles.number}>
                  {dashboard.total_quizzes_failed ?? 0}
                </p>

                <p style={styles.cardDescription}>
                  Unsuccessful attempts
                </p>
              </div>

              {/* AVERAGE */}

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  Average Percentage
                </h3>

                <p style={styles.number}>
                  {Number(
                    dashboard.average_score ?? 0
                  ).toFixed(2)}
                  %
                </p>

                <p style={styles.cardDescription}>
                  Your average performance
                </p>
              </div>

              {/* HIGHEST */}

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  Highest Percentage
                </h3>

                <p style={styles.number}>
                  {Number(
                    dashboard.highest_score ?? 0
                  ).toFixed(2)}
                  %
                </p>

                <p style={styles.cardDescription}>
                  Your best performance
                </p>
              </div>

              {/* QUESTIONS */}

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  Questions Answered
                </h3>

                <p style={styles.number}>
                  {dashboard.total_questions_answered ?? 0}
                </p>

                <p style={styles.cardDescription}>
                  Total questions answered
                </p>
              </div>

            </div>


            {/* =================================================
                PERFORMANCE
            ================================================= */}

            <h2 style={styles.sectionTitle}>
              Performance
            </h2>

            <div style={styles.chartCard}>

              <h3 style={styles.chartTitle}>
                Your Recent Quiz Performance
              </h3>

              {dashboard.performance_data &&
              dashboard.performance_data.length > 0 ? (

                <div style={styles.chartContainer}>

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={dashboard.performance_data.map(
                        (attempt, index) => ({
                          name: `Attempt ${index + 1}`,

                          percentage: Number(
                            attempt.percentage ?? 0
                          ),

                          quiz_title:
                            attempt.quiz_title ||
                            "Quiz",
                        })
                      )}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) =>
                          `${value}%`
                        }
                      />

                      <Tooltip
                        formatter={(value) =>
                          `${Number(value).toFixed(2)}%`
                        }
                        labelFormatter={(label) => label}
                      />

                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              ) : (

                <div style={styles.noData}>
                  <p>
                    No performance data available.
                  </p>
                </div>

              )}

            </div>


            {/* =================================================
                RECENT ATTEMPTS
            ================================================= */}

            <h2 style={styles.sectionTitle}>
              Recent Attempts
            </h2>

            {dashboard.recent_attempts &&
            dashboard.recent_attempts.length > 0 ? (

              <div style={styles.attemptsContainer}>

                {dashboard.recent_attempts.map(
                  (attempt, index) => {

                    const isPassed =
                      attempt.status === "PASSED";

                    return (
                      <div
                        key={
                          attempt.attempt_id ||
                          attempt.id ||
                          index
                        }
                        style={styles.attemptCard}
                      >

                        <div style={styles.attemptHeader}>

                          <div>
                            <h3
                              style={styles.quizTitle}
                            >
                              {attempt.quiz_title ||
                                "Quiz"}
                            </h3>

                            <p
                              style={
                                styles.attemptId
                              }
                            >
                              Attempt ID:{" "}
                              {attempt.attempt_id ||
                                attempt.id ||
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
                            {attempt.status ||
                              "FAILED"}
                          </span>

                        </div>

                        <div
                          style={
                            styles.attemptDetails
                          }
                        >

                          <div>
                            <strong>
                              Score
                            </strong>

                            <span>
                              {attempt.score ?? 0}
                            </span>
                          </div>

                          <div>
                            <strong>
                              Percentage
                            </strong>

                            <span>
                              {Number(
                                attempt.percentage ??
                                  0
                              ).toFixed(2)}
                              %
                            </span>
                          </div>

                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/student/result/${
                                attempt.attempt_id ||
                                attempt.id
                              }`
                            )
                          }
                          style={styles.resultButton}
                        >
                          View Result
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div style={styles.messageCard}>
                <h3>
                  No recent attempts found.
                </h3>

                <p>
                  Start a quiz to see your performance
                  here.
                </p>
              </div>

            )}


            {/* =================================================
                STUDENT NAVIGATION
            ================================================= */}

            <h2 style={styles.sectionTitle}>
              Quick Navigation
            </h2>

            <div style={styles.navigation}>

              {/* TAKE QUIZ */}

              <button
                onClick={() =>
                  navigate("/student/quiz")
                }
                style={styles.primaryButton}
              >
                Take Quiz
              </button>

              {/* HISTORY */}

              <button
                onClick={() =>
                  navigate("/student/history")
                }
                style={styles.secondaryButton}
              >
                Quiz History
              </button>

              {/* LEADERBOARD */}

              <button
                onClick={() =>
                  navigate("/student/leaderboard")
                }
                style={styles.secondaryButton}
              >
                Leaderboard
              </button>

            </div>

          </>
        )}

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
    backgroundColor: "#f5f7fb",
    padding: "40px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1200px",
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
    marginBottom: "35px",
    flexWrap: "wrap",
  },

  title: {
    margin: "0 0 10px 0",
    fontSize: "32px",
    color: "#111827",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  leaderboardButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
  },

  /* =====================================================
     SECTION
  ===================================================== */

  sectionTitle: {
    marginTop: "35px",
    marginBottom: "20px",
    color: "#111827",
    fontSize: "22px",
  },

  /* =====================================================
     STATISTICS
  ===================================================== */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "25px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  cardTitle: {
    margin: 0,
    color: "#374151",
    fontSize: "16px",
  },

  number: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "15px 0 5px 0",
    color: "#2563eb",
  },

  cardDescription: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },

  /* =====================================================
     CHART
  ===================================================== */

  chartCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "25px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  chartTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#374151",
  },

  chartContainer: {
    width: "100%",
    height: "350px",
  },

  noData: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
  },

  /* =====================================================
     ATTEMPTS
  ===================================================== */

  attemptsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  attemptCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  attemptHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
  },

  quizTitle: {
    margin: "0 0 5px 0",
    color: "#111827",
  },

  attemptId: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },

  attemptDetails: {
    display: "flex",
    gap: "50px",
    marginTop: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  attemptDetail: {
    display: "flex",
    flexDirection: "column",
  },

  passed: {
    display: "inline-block",
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  failed: {
    display: "inline-block",
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  resultButton: {
    padding: "9px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#374151",
    color: "#ffffff",
    fontSize: "14px",
  },

  /* =====================================================
     NAVIGATION
  ===================================================== */

  navigation: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "10px",
    marginBottom: "40px",
  },

  primaryButton: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
  },

  secondaryButton: {
    padding: "12px 22px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "14px",
  },

  /* =====================================================
     ERROR
  ===================================================== */

  error: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    border: "1px solid #fca5a5",
    padding: "14px",
    borderRadius: "7px",
    marginBottom: "20px",
  },

  /* =====================================================
     EMPTY / MESSAGE
  ===================================================== */

  messageCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "25px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  /* =====================================================
     LOADING
  ===================================================== */

  loadingCard: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },
};

export default StudentDashboard;