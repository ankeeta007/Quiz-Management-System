import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAttempts() {
  const API_URL = "https://quiz-management-system-o5i7.onrender.com/api";
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
  // FETCH ALL ATTEMPTS
  // =====================================================

  const fetchAttempts = async () => {
    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/attempts/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getResponseData(response);

      console.log("ADMIN ATTEMPTS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to fetch attempts."
        );
      }

      const attemptList = Array.isArray(data)
        ? data
        : data.results || [];

      setAttempts(attemptList);
    } catch (err) {
      console.error("Admin attempts error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchAttempts();
  }, []);

  // =====================================================
  // VIEW RESULT
  // =====================================================

  const handleViewResult = (attemptId) => {
    navigate(`/admin/result/${attemptId}`);
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined ||
      seconds === ""
    ) {
      return "-";
    }

    const totalSeconds = Number(seconds);

    if (isNaN(totalSeconds)) {
      return "-";
    }

    const minutes = Math.floor(totalSeconds / 60);

    const remainingSeconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredAttempts = attempts.filter((attempt) => {
    const searchText = `
      ${attempt.student_username || ""}
      ${attempt.quiz_title || ""}
      ${attempt.attempt_id || ""}
      ${attempt.student_id || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      statusFilter === "ALL" ||
      attempt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalAttempts = attempts.length;

  const passedAttempts = attempts.filter(
    (attempt) => attempt.status === "PASSED"
  ).length;

  const failedAttempts = attempts.filter(
    (attempt) => attempt.status === "FAILED"
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <h2>Student Attempts</h2>
          <p>Loading attempts...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Student Attempts
          </h1>

          <p style={styles.subtitle}>
            Monitor quiz attempts and student results
          </p>
        </div>

        <button
          onClick={fetchAttempts}
          style={styles.refreshButton}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.errorBox}>
          <strong>
            Unable to load attempts
          </strong>

          <p>{error}</p>
        </div>
      )}

      {/* STATISTICS */}

      <div style={styles.statsGrid}>

        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {totalAttempts}
          </span>

          <span style={styles.statLabel}>
            Total Attempts
          </span>
        </div>

        <div style={styles.statCard}>
          <span
            style={{
              ...styles.statNumber,
              color: "#15803d",
            }}
          >
            {passedAttempts}
          </span>

          <span style={styles.statLabel}>
            Passed
          </span>
        </div>

        <div style={styles.statCard}>
          <span
            style={{
              ...styles.statNumber,
              color: "#dc2626",
            }}
          >
            {failedAttempts}
          </span>

          <span style={styles.statLabel}>
            Failed
          </span>
        </div>

      </div>

      {/* FILTERS */}

      <div style={styles.filterCard}>

        <input
          type="text"
          placeholder="Search by student, quiz or attempt ID..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={styles.searchInput}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={styles.statusSelect}
        >
          <option value="ALL">
            All Status
          </option>

          <option value="PASSED">
            Passed
          </option>

          <option value="FAILED">
            Failed
          </option>
        </select>

      </div>

      {/* RESULT COUNT */}

      <div style={styles.resultInfo}>
        Showing{" "}
        <strong>
          {filteredAttempts.length}
        </strong>{" "}
        of{" "}
        <strong>
          {attempts.length}
        </strong>{" "}
        attempts
      </div>

      {/* TABLE */}

      {filteredAttempts.length === 0 ? (

        <div style={styles.emptyBox}>

          <h3>
            No attempts found
          </h3>

          <p>
            There are no completed quiz attempts
            matching your search.
          </p>

        </div>

      ) : (

        <div style={styles.tableContainer}>

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Attempt ID
                  </th>

                  <th style={styles.th}>
                    Student
                  </th>

                  <th style={styles.th}>
                    Quiz
                  </th>

                  <th style={styles.th}>
                    Score
                  </th>

                  <th style={styles.th}>
                    Percentage
                  </th>

                  <th style={styles.th}>
                    Correct
                  </th>

                  <th style={styles.th}>
                    Incorrect
                  </th>

                  <th style={styles.th}>
                    Unanswered
                  </th>

                  <th style={styles.th}>
                    Time Taken
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    Completed
                  </th>

                  <th style={styles.th}>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredAttempts.map((attempt) => (

                  <tr key={attempt.attempt_id}>

                    {/* ATTEMPT ID */}

                    <td style={styles.td}>
                      #{attempt.attempt_id}
                    </td>

                    {/* STUDENT */}

                    <td style={styles.td}>

                      <strong>
                        {attempt.student_username || "-"}
                      </strong>

                      <div style={styles.smallText}>
                        ID:{" "}
                        {attempt.student_id || "-"}
                      </div>

                    </td>

                    {/* QUIZ */}

                    <td style={styles.td}>
                      {attempt.quiz_title || "-"}
                    </td>

                    {/* SCORE */}

                    <td style={styles.td}>
                      {attempt.score ?? "-"}
                    </td>

                    {/* PERCENTAGE */}

                    <td style={styles.td}>
                      <strong>
                        {attempt.percentage !== null &&
                        attempt.percentage !== undefined
                          ? `${Number(
                              attempt.percentage
                            ).toFixed(1)}%`
                          : "-"}
                      </strong>
                    </td>

                    {/* CORRECT */}

                    <td style={styles.td}>
                      <span
                        style={styles.correctBadge}
                      >
                        {attempt.correct_answers ?? 0}
                      </span>
                    </td>

                    {/* INCORRECT */}

                    <td style={styles.td}>
                      <span
                        style={styles.incorrectBadge}
                      >
                        {attempt.incorrect_answers ?? 0}
                      </span>
                    </td>

                    {/* UNANSWERED */}

                    <td style={styles.td}>
                      <span
                        style={styles.unansweredBadge}
                      >
                        {attempt.unanswered ?? 0}
                      </span>
                    </td>

                    {/* TIME */}

                    <td style={styles.td}>
                      {formatTime(
                        attempt.time_taken
                      )}
                    </td>

                    {/* STATUS */}

                    <td style={styles.td}>

                      {attempt.status === "PASSED" ? (

                        <span
                          style={styles.passedBadge}
                        >
                          PASSED
                        </span>

                      ) : (

                        <span
                          style={styles.failedBadge}
                        >
                          FAILED
                        </span>

                      )}

                    </td>

                    {/* COMPLETED */}

                    <td style={styles.td}>
                      {formatDate(
                        attempt.completed_at
                      )}
                    </td>

                    {/* ACTION */}

                    <td style={styles.td}>

                      <button
                        onClick={() =>
                          handleViewResult(
                            attempt.attempt_id
                          )
                        }
                        style={styles.viewButton}
                      >
                        View Result
                      </button>

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

// =====================================================
// STYLES
// =====================================================

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
    marginTop: "8px",
    color: "#666",
    fontSize: "15px",
  },

  refreshButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  errorBox: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b91c1c",
    padding: "15px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  statLabel: {
    color: "#666",
    fontSize: "14px",
  },

  filterCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },

  searchInput: {
    flex: 1,
    minWidth: "250px",
    padding: "12px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  statusSelect: {
    padding: "12px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "white",
    fontSize: "14px",
    minWidth: "150px",
  },

  resultInfo: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "15px",
  },

  tableContainer: {
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1450px",
  },

  th: {
    backgroundColor: "#f8fafc",
    padding: "14px",
    textAlign: "left",
    color: "#444",
    borderBottom: "1px solid #ddd",
    whiteSpace: "nowrap",
    fontSize: "13px",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #eee",
    color: "#555",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  smallText: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#888",
  },

  correctBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "5px 9px",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "12px",
  },

  incorrectBadge: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "5px 9px",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "12px",
  },

  unansweredBadge: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    padding: "5px 9px",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "12px",
  },

  passedBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  failedBadge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  viewButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  emptyBox: {
    backgroundColor: "white",
    padding: "60px 30px",
    textAlign: "center",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    color: "#777",
  },

  loadingBox: {
    backgroundColor: "white",
    padding: "40px",
    maxWidth: "500px",
    margin: "80px auto",
    textAlign: "center",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },
};

export default AdminAttempts;