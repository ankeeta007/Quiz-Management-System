import { useEffect, useState } from "react";

function QuestionManagement() {
  const API_URL = "https://quiz-management-system-o5i7.onrender.com/api";

  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // =====================================================
  // EMPTY OPTIONS
  // =====================================================

  const emptyOptions = () => [
    {
      option_text: "",
      is_correct: false,
    },
    {
      option_text: "",
      is_correct: false,
    },
    {
      option_text: "",
      is_correct: false,
    },
    {
      option_text: "",
      is_correct: false,
    },
  ];

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = () => ({
    question_text: "",
    marks: 1,
    explanation: "",
    options: emptyOptions(),
  });

  const [formData, setFormData] = useState(emptyForm());

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
  // FETCH QUIZZES
  // =====================================================

  const fetchQuizzes = async () => {
    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      setPageLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/quizzes/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to fetch quizzes."
        );
      }

      const quizList = Array.isArray(data)
        ? data
        : data.results || [];

      setQuizzes(quizList);
    } catch (err) {
      console.error("Fetch quizzes error:", err);
      setError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  // =====================================================
  // FETCH QUESTIONS
  // =====================================================

  const fetchQuestions = async (quizId) => {
    if (!quizId) {
      setQuestions([]);
      return;
    }

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/quizzes/${quizId}/questions/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to fetch questions."
        );
      }

      const questionList = Array.isArray(data)
        ? data
        : data.results || [];

      setQuestions(questionList);
    } catch (err) {
      console.error("Fetch questions error:", err);
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // =====================================================
  // QUIZ CHANGE
  // =====================================================

  const handleQuizChange = (event) => {
    const quizId = event.target.value;

    setSelectedQuiz(quizId);
    setShowForm(false);
    setEditingQuestion(null);
    setFormData(emptyForm());
    setQuestions([]);
    setError("");

    if (quizId) {
      fetchQuestions(quizId);
    }
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // OPTION CHANGE
  // =====================================================

  const handleOptionChange = (index, value) => {
    setFormData((previous) => {
      const updatedOptions = [...previous.options];

      updatedOptions[index] = {
        ...updatedOptions[index],
        option_text: value,
      };

      return {
        ...previous,
        options: updatedOptions,
      };
    });
  };

  // =====================================================
  // CORRECT ANSWER
  // =====================================================

  const handleCorrectAnswer = (index) => {
    setFormData((previous) => ({
      ...previous,
      options: previous.options.map(
        (option, optionIndex) => ({
          ...option,
          is_correct: optionIndex === index,
        })
      ),
    }));
  };

  // =====================================================
  // CREATE QUESTION
  // =====================================================

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData(emptyForm());
    setError("");
    setShowForm(true);
  };

  // =====================================================
  // EDIT QUESTION
  // =====================================================

  const handleEdit = (question) => {
    setEditingQuestion(question);

    let existingOptions = [];

    if (
      question.options &&
      Array.isArray(question.options)
    ) {
      existingOptions = question.options.map(
        (option) => ({
          option_text: option.option_text || "",
          is_correct: Boolean(option.is_correct),
        })
      );
    }

    while (existingOptions.length < 4) {
      existingOptions.push({
        option_text: "",
        is_correct: false,
      });
    }

    setFormData({
      question_text:
        question.question_text || "",

      marks:
        question.marks || 1,

      explanation:
        question.explanation || "",

      options:
        existingOptions.slice(0, 4),
    });

    setError("");
    setShowForm(true);
  };

  // =====================================================
  // SAVE QUESTION
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!selectedQuiz) {
      setError("Please select a quiz first.");
      return;
    }

    if (!formData.question_text.trim()) {
      setError("Please enter the question.");
      return;
    }

    if (
      !formData.marks ||
      Number(formData.marks) < 1
    ) {
      setError("Marks must be at least 1.");
      return;
    }

    const filledOptions =
      formData.options.filter(
        (option) =>
          option.option_text.trim() !== ""
      );

    if (filledOptions.length < 2) {
      setError(
        "Please enter at least 2 options."
      );
      return;
    }

    const correctOptions =
      filledOptions.filter(
        (option) => option.is_correct
      );

    if (correctOptions.length !== 1) {
      setError(
        "Please select exactly one correct answer."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const payload = {
      quiz: Number(selectedQuiz),

      question_text:
        formData.question_text.trim(),

      marks: Number(formData.marks),

      explanation:
        formData.explanation.trim(),

      options: filledOptions.map(
        (option) => ({
          option_text:
            option.option_text.trim(),

          is_correct:
            option.is_correct,
        })
      ),
    };

    try {
      setLoading(true);

      const url = editingQuestion
        ? `${API_URL}/quizzes/${selectedQuiz}/questions/${editingQuestion.id}/`
        : `${API_URL}/quizzes/${selectedQuiz}/questions/`;

      const method = editingQuestion
        ? "PUT"
        : "POST";

      console.log(
        "QUESTION PAYLOAD:",
        payload
      );

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data =
        await getResponseData(response);

      console.log(
        "QUESTION RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Failed to save question."
        );
      }

      alert(
        editingQuestion
          ? "Question updated successfully!"
          : "Question created successfully!"
      );

      setShowForm(false);
      setEditingQuestion(null);
      setFormData(emptyForm());

      await fetchQuestions(selectedQuiz);
    } catch (err) {
      console.error(
        "Save question error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE QUESTION
  // =====================================================

  const handleDelete = async (questionId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this question?"
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/quizzes/${selectedQuiz}/questions/${questionId}/`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data =
          await getResponseData(response);

        throw new Error(
          data.error ||
            data.detail ||
            "Failed to delete question."
        );
      }

      alert(
        "Question deleted successfully!"
      );

      await fetchQuestions(selectedQuiz);
    } catch (err) {
      console.error(
        "Delete question error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData(emptyForm());
    setError("");
  };

  // =====================================================
  // PAGE LOADING
  // =====================================================

  if (pageLoading) {
    return (
      <div style={styles.page}>
        <h1>Question Management</h1>
        <p>Loading quizzes...</p>
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
            Question Management
          </h1>

          <p style={styles.subtitle}>
            Create, edit and delete quiz questions
          </p>
        </div>

        <div style={styles.countBox}>
          <strong>{questions.length}</strong>
          <span>Questions</span>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      {/* SELECT QUIZ */}

      <div style={styles.quizSelector}>
        <label style={styles.label}>
          Select Quiz
        </label>

        <select
          value={selectedQuiz}
          onChange={handleQuizChange}
          style={styles.select}
        >
          <option value="">
            Select a Quiz
          </option>

          {quizzes.map((quiz) => (
            <option
              key={quiz.id}
              value={quiz.id}
            >
              {quiz.title}
            </option>
          ))}
        </select>
      </div>

      {/* NO QUIZ */}

      {!selectedQuiz && (
        <div style={styles.infoBox}>
          <h3>Select a quiz</h3>

          <p>
            Select a quiz above to view and
            manage its questions.
          </p>
        </div>
      )}

      {/* QUESTION AREA */}

      {selectedQuiz && (
        <>

          {/* TOP BAR */}

          <div style={styles.questionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Questions
              </h2>

              <p style={styles.sectionText}>
                Manage questions for the
                selected quiz.
              </p>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              style={styles.primaryButton}
            >
              + Add Question
            </button>
          </div>

          {/* LOADING */}

          {loading && (
            <p style={styles.loadingText}>
              Loading...
            </p>
          )}

          {/* EMPTY */}

          {!loading &&
            questions.length === 0 && (
              <div style={styles.emptyBox}>
                <h3>
                  No questions found
                </h3>

                <p>
                  Add the first question
                  to this quiz.
                </p>

                <button
                  onClick={handleCreate}
                  style={styles.primaryButton}
                >
                  + Add Question
                </button>
              </div>
            )}

          {/* QUESTIONS */}

          {!loading &&
            questions.length > 0 && (
              <div style={styles.questionList}>

                {questions.map(
                  (question, index) => (
                    <div
                      key={question.id}
                      style={styles.questionCard}
                    >

                      {/* QUESTION HEADER */}

                      <div
                        style={
                          styles.questionTop
                        }
                      >
                        <div>
                          <span
                            style={
                              styles.questionNumber
                            }
                          >
                            Question{" "}
                            {index + 1}
                          </span>

                          <h3
                            style={
                              styles.questionText
                            }
                          >
                            {
                              question.question_text
                            }
                          </h3>
                        </div>

                        <span
                          style={
                            styles.marksBadge
                          }
                        >
                          {question.marks}{" "}
                          Mark
                          {Number(
                            question.marks
                          ) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                      {/* OPTIONS */}

                      <div
                        style={
                          styles.optionsContainer
                        }
                      >
                        {question.options &&
                        question.options.length >
                          0 ? (
                          question.options.map(
                            (
                              option,
                              optionIndex
                            ) => (
                              <div
                                key={
                                  option.id ||
                                  optionIndex
                                }
                                style={
                                  option.is_correct
                                    ? styles.correctOption
                                    : styles.option
                                }
                              >
                                <span>
                                  {String.fromCharCode(
                                    65 +
                                      optionIndex
                                  )}.
                                </span>

                                <span>
                                  {
                                    option.option_text
                                  }
                                </span>

                                {option.is_correct && (
                                  <span
                                    style={
                                      styles.correctBadge
                                    }
                                  >
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            )
                          )
                        ) : (
                          <p>
                            No options available.
                          </p>
                        )}
                      </div>

                      {/* EXPLANATION */}

                      {question.explanation && (
                        <div
                          style={
                            styles.explanation
                          }
                        >
                          <strong>
                            Explanation:
                          </strong>{" "}
                          {
                            question.explanation
                          }
                        </div>
                      )}

                      {/* ACTIONS */}

                      <div
                        style={
                          styles.actions
                        }
                      >
                        <button
                          onClick={() =>
                            handleEdit(
                              question
                            )
                          }
                          disabled={loading}
                          style={
                            styles.editButton
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              question.id
                            )
                          }
                          disabled={loading}
                          style={
                            styles.deleteButton
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )}

              </div>
            )}

          {/* =================================================
              CREATE / EDIT FORM
          ================================================= */}

          {showForm && (
            <div style={styles.formCard}>

              <div
                style={
                  styles.formHeader
                }
              >
                <div>
                  <h2>
                    {editingQuestion
                      ? "Edit Question"
                      : "Create Question"}
                  </h2>

                  <p>
                    Add the question,
                    options and correct
                    answer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCancel}
                  style={
                    styles.closeButton
                  }
                  disabled={loading}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
              >

                {/* QUESTION */}

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Question
                  </label>

                  <textarea
                    name="question_text"
                    value={
                      formData.question_text
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="Enter your question..."
                    style={
                      styles.textarea
                    }
                  />
                </div>

                {/* MARKS */}

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Marks
                  </label>

                  <input
                    type="number"
                    name="marks"
                    value={
                      formData.marks
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    style={
                      styles.numberInput
                    }
                  />
                </div>

                {/* EXPLANATION */}

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Explanation
                  </label>

                  <textarea
                    name="explanation"
                    value={
                      formData.explanation
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                    placeholder="Enter explanation for the answer..."
                    style={
                      styles.textarea
                    }
                  />
                </div>

                {/* OPTIONS */}

                <div
                  style={
                    styles.optionsForm
                  }
                >
                  <h3>
                    Answer Options
                  </h3>

                  <p
                    style={
                      styles.optionHint
                    }
                  >
                    Enter the options
                    and select exactly
                    one correct answer.
                  </p>

                  {formData.options.map(
                    (
                      option,
                      index
                    ) => (
                      <div
                        key={index}
                        style={
                          styles.optionRow
                        }
                      >
                        <span
                          style={
                            styles.optionLetter
                          }
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <input
                          type="text"
                          value={
                            option.option_text
                          }
                          onChange={(
                            event
                          ) =>
                            handleOptionChange(
                              index,
                              event.target
                                .value
                            )
                          }
                          placeholder={`Option ${
                            index + 1
                          }`}
                          style={
                            styles.optionInput
                          }
                        />

                        <label
                          style={
                            styles.radioLabel
                          }
                        >
                          <input
                            type="radio"
                            name="correctOption"
                            checked={
                              option.is_correct
                            }
                            onChange={() =>
                              handleCorrectAnswer(
                                index
                              )
                            }
                          />

                          Correct
                        </label>
                      </div>
                    )
                  )}
                </div>

                {/* FORM BUTTONS */}

                <div
                  style={
                    styles.formActions
                  }
                >
                  <button
                    type="submit"
                    disabled={loading}
                    style={
                      styles.primaryButton
                    }
                  >
                    {loading
                      ? "Saving..."
                      : editingQuestion
                      ? "Update Question"
                      : "Create Question"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleCancel
                    }
                    disabled={loading}
                    style={
                      styles.cancelButton
                    }
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          )}
        </>
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
    padding: "40px",
    backgroundColor: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    color: "#222",
    fontSize: "32px",
  },

  subtitle: {
    color: "#666",
    marginTop: "8px",
  },

  countBox: {
    backgroundColor: "#ffffff",
    padding: "15px 25px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  quizSelector: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
  },

  select: {
    width: "100%",
    maxWidth: "500px",
    padding: "12px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    backgroundColor: "#fff",
  },

  errorBox: {
    backgroundColor: "#fff1f2",
    border:
      "1px solid #fecdd3",
    color: "#b91c1c",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    maxWidth: "900px",
  },

  infoBox: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
  },

  sectionText: {
    color: "#666",
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  loadingText: {
    color: "#555",
  },

  emptyBox: {
    backgroundColor: "#ffffff",
    padding: "50px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  questionCard: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  questionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },

  questionNumber: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "bold",
  },

  questionText: {
    marginTop: "8px",
    color: "#222",
  },

  marksBadge: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "7px 12px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
    fontWeight: "bold",
  },

  optionsContainer: {
    marginTop: "20px",
  },

  option: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    marginBottom: "8px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  correctOption: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    marginBottom: "8px",
    border:
      "1px solid #86efac",
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
  },

  correctBadge: {
    marginLeft: "auto",
    color: "#15803d",
    fontWeight: "bold",
    fontSize: "13px",
  },

  explanation: {
    marginTop: "15px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    color: "#555",
  },

  actions: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },

  editButton: {
    padding: "9px 18px",
    border:
      "1px solid #2563eb",
    color: "#2563eb",
    backgroundColor: "#fff",
    borderRadius: "7px",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "9px 18px",
    border:
      "1px solid #dc2626",
    color: "#dc2626",
    backgroundColor: "#fff",
    borderRadius: "7px",
    cursor: "pointer",
  },

  formCard: {
    backgroundColor: "#ffffff",
    marginTop: "30px",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "850px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.1)",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  closeButton: {
    border: "none",
    backgroundColor: "transparent",
    fontSize: "28px",
    cursor: "pointer",
    color: "#666",
  },

  formGroup: {
    marginBottom: "22px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    resize: "vertical",
  },

  numberInput: {
    padding: "10px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    width: "120px",
  },

  optionsForm: {
    marginTop: "25px",
  },

  optionHint: {
    color: "#666",
    fontSize: "14px",
  },

  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    padding: "12px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  optionLetter: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    borderRadius: "50%",
    fontWeight: "bold",
  },

  optionInput: {
    flex: 1,
    padding: "10px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    whiteSpace: "nowrap",
    fontSize: "14px",
  },

  formActions: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  cancelButton: {
    padding: "11px 20px",
    border:
      "1px solid #9ca3af",
    backgroundColor: "#fff",
    color: "#444",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default QuestionManagement;