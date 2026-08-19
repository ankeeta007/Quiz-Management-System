import { useEffect, useState } from "react";

function StudentQuiz() {
  const API_URL =
    `${import.meta.env.VITE_API_URL}/api`;

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // LOAD QUIZZES
  // ==========================================

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/quizzes/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load quizzes."
        );
      }

      setQuizzes(data.results || data);
    } catch (error) {
      console.error("Load quizzes error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // QUIZ TIMER
  // ==========================================

  useEffect(() => {
    if (!selectedQuiz || !attempt || result) {
      return;
    }

    const durationInSeconds =
      Number(selectedQuiz.duration) * 60;

    const startedAt =
      new Date(attempt.started_at).getTime();

    const updateTimer = () => {
      const now = Date.now();

      const elapsedSeconds = Math.floor(
        (now - startedAt) / 1000
      );

      const remaining =
        durationInSeconds - elapsedSeconds;

      if (remaining <= 0) {
        setTimeLeft(0);
        return false;
      }

      setTimeLeft(remaining);
      return true;
    };

    // Update immediately
    const running = updateTimer();

    if (!running) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      const running = updateTimer();

      if (!running) {
        clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [selectedQuiz, attempt, result]);

  // ==========================================
  // START QUIZ
  // ==========================================

  const handleQuizSelect = async (quiz) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswers({});
    setResult(null);
    setQuestions([]);
    setAttempt(null);
    setSelectedQuiz(null);
    setCurrentQuestion(0);

    try {
      // Start attempt
      const startResponse = await fetch(
        `${API_URL}/quizzes/${quiz.id}/start/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const startData = await startResponse.json();

      console.log("START RESPONSE:", startData);

      if (!startResponse.ok) {
        throw new Error(
          startData.error || "Unable to start quiz."
        );
      }

      setAttempt(startData);
      setSelectedQuiz(quiz);

      // Load questions
      const questionResponse = await fetch(
        `${API_URL}/quizzes/${quiz.id}/questions/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const questionData = await questionResponse.json();

      console.log("QUESTIONS RESPONSE:", questionData);

      console.log(
        "QUESTION IDs FROM FRONTEND:",
        (questionData.results || questionData).map(
          (question) => question.id
        )
      );

      if (!questionResponse.ok) {
        throw new Error(
          questionData.error ||
            "Unable to load questions."
        );
      }

      setQuestions(
        questionData.results || questionData
      );
    } catch (error) {
      console.error("Start quiz error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SELECT ANSWER
  // ==========================================

  const handleAnswerChange = (
    questionId,
    optionId
  ) => {
    setAnswers((previousAnswers) => {
      const updatedAnswers = {
        ...previousAnswers,
        [questionId]: Number(optionId),
      };

      console.log(
        "SELECTED ANSWERS:",
        updatedAnswers
      );

      return updatedAnswers;
    });
  };

  // ==========================================
  // NEXT QUESTION
  // ==========================================

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(
        currentQuestion + 1
      );
    }
  };

  // ==========================================
  // PREVIOUS QUESTION
  // ==========================================

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        currentQuestion - 1
      );
    }
  };

  // ==========================================
  // SUBMIT QUIZ
  // ==========================================

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!attempt) {
      setError("You are not logged in.")
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setIsSubmitting(true);

    // Backend expects:
    // question_id
    // option_id

    const submittedAnswers = Object.entries(
      answers
    ).map(([questionId, optionId]) => ({
      question_id: Number(questionId),
      option_id: Number(optionId),
    }));

    console.log(
      "SUBMITTED ANSWERS:",
      submittedAnswers
    );

    

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/attempts/${attempt.id}/submit/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: submittedAnswers,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "SUBMIT RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to submit quiz."
        );
      }

      setResult(data);
    } catch (error) {
      console.error(
        "Submit quiz error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // BACK TO QUIZ LIST
  // ==========================================

  const handleBack = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    setAnswers({});
    setAttempt(null);
    setResult(null);
    setError("");
    setCurrentQuestion(0);
    setTimeLeft(0);
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Student Quiz</h1>

      {/* ERROR */}

      {error && (
        <div
          style={{
            border: "1px solid red",
            color: "red",
            padding: "12px",
            marginBottom: "20px",
            maxWidth: "800px",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <p>
          <strong>Loading...</strong>
        </p>
      )}

      {/* ==========================================
          QUIZ LIST
      ========================================== */}

      {!selectedQuiz &&
        !result &&
        !loading && (
          <>
            <h2>Available Quizzes</h2>

            {quizzes.length === 0 ? (
              <p>No quizzes available.</p>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  style={{
                    border: "1px solid #333",
                    padding: "20px",
                    marginBottom: "20px",
                    maxWidth: "750px",
                  }}
                >
                  <h2>{quiz.title}</h2>

                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {quiz.description}
                  </p>

                  <p>
                    <strong>
                      Category:
                    </strong>{" "}
                    {quiz.category_name}
                  </p>

                  <p>
                    <strong>
                      Difficulty:
                    </strong>{" "}
                    {quiz.difficulty}
                  </p>

                  <p>
                    <strong>
                      Duration:
                    </strong>{" "}
                    {quiz.duration} minutes
                  </p>

                  <p>
                    <strong>
                      Passing Percentage:
                    </strong>{" "}
                    {quiz.passing_percentage}%
                  </p>

                  <p>
                    <strong>
                      Maximum Attempts:
                    </strong>{" "}
                    {quiz.max_attempts}
                  </p>

                  <button
                    onClick={() =>
                      handleQuizSelect(quiz)
                    }
                    style={{
                      padding: "10px 20px",
                      cursor: "pointer",
                    }}
                  >
                    Start Quiz
                  </button>
                </div>
              ))
            )}
          </>
        )}

      {/* ==========================================
          QUIZ + QUESTIONS
      ========================================== */}

      {selectedQuiz && !result && (
        <div>
          <h1>{selectedQuiz.title}</h1>

          <div
            style={{
              border: "2px solid #333",
              padding: "15px",
              marginBottom: "20px",
              maxWidth: "300px",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Time Remaining:{" "}
            {Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0")}
            :
            {(timeLeft % 60)
              .toString()
              .padStart(2, "0")}
          </div>

          <p>
            <strong>
              Description:
            </strong>{" "}
            {selectedQuiz.description}
          </p>

          <p>
            <strong>
              Category:
            </strong>{" "}
            {selectedQuiz.category_name}
          </p>

          <p>
            <strong>
              Difficulty:
            </strong>{" "}
            {selectedQuiz.difficulty}
          </p>

          <p>
            <strong>
              Duration:
            </strong>{" "}
            {selectedQuiz.duration} minutes
          </p>

          <p>
            <strong>
              Passing Percentage:
            </strong>{" "}
            {selectedQuiz.passing_percentage}%
          </p>

          <p>
            <strong>
              Maximum Attempts:
            </strong>{" "}
            {selectedQuiz.max_attempts}
          </p>

          <hr />

          {/* ==========================================
              QUESTIONS
          ========================================== */}

          <h2>Questions</h2>

          {questions.length === 0 ? (
            <p>
              No questions found for this quiz.
            </p>
          ) : (
            <div
              style={{
                border: "1px solid #333",
                padding: "20px",
                marginBottom: "20px",
                maxWidth: "800px",
              }}
            >
              {/* QUESTION NUMBER */}

              <p>
                <strong>
                  Question {currentQuestion + 1} of{" "}
                  {questions.length}
                </strong>
              </p>

              {/* QUESTION */}

              <h3>
                {questions[currentQuestion].question_text}
              </h3>

              <p>
                <strong>Marks:</strong>{" "}
                {questions[currentQuestion].marks}
              </p>

              {/* OPTIONS */}

              {questions[currentQuestion].options &&
              questions[currentQuestion].options.length > 0 ? (
                questions[
                  currentQuestion
                ].options.map((option) => (
                  <div
                    key={option.id}
                    style={{
                      marginBottom: "12px",
                    }}
                  >
                    <label
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${questions[currentQuestion].id}`}
                        value={option.id}
                        checked={
                          Number(
                            answers[
                              questions[currentQuestion].id
                            ]
                          ) === Number(option.id)
                        }
                        onChange={() =>
                          handleAnswerChange(
                            questions[currentQuestion]
                              .id,
                            option.id
                          )
                        }
                      />

                      {" "}

                      {option.option_text}
                    </label>
                  </div>
                ))
              ) : (
                <p>
                  No options available.
                </p>
              )}

              {/* ==========================================
                  QUESTION NAVIGATION
              ========================================== */}

              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={
                    handlePreviousQuestion
                  }
                  disabled={
                    currentQuestion === 0 ||
                    loading
                  }
                  style={{
                    padding: "10px 20px",
                    cursor:
                      currentQuestion === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Previous
                </button>

                {currentQuestion <
                questions.length - 1 ? (
                  <button
                    onClick={
                      handleNextQuestion
                    }
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      cursor: "pointer",
                    }}
                  >
                    Next
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* ==========================================
              SUBMIT QUIZ
          ========================================== */}

          {questions.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "10px 25px",
                marginRight: "10px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Submitting..."
                : "Submit Quiz"}
            </button>
          )}

          {/* BACK */}

          <button
            onClick={handleBack}
            disabled={loading}
            style={{
              padding: "10px 25px",
              cursor: "pointer",
            }}
          >
            Back to Quizzes
          </button>
        </div>
      )}

      {/* ==========================================
          RESULT
      ========================================== */}

      {result && (
        <div>
          <h2>Quiz Result</h2>

          <div
            style={{
              border: "2px solid #333",
              padding: "25px",
              maxWidth: "650px",
            }}
          >
            <h2>
              {selectedQuiz
                ? selectedQuiz.title
                : "Quiz"}
            </h2>

            <p>
              <strong>
                Score:
              </strong>{" "}
              {result.score}
            </p>

            <p>
              <strong>
                Percentage:
              </strong>{" "}
              {Number(
                result.percentage || 0
              ).toFixed(2)}
              %
            </p>

            <p>
              <strong>
                Correct Answers:
              </strong>{" "}
              {result.correct_answers}
            </p>

            <p>
              <strong>
                Incorrect Answers:
              </strong>{" "}
              {result.incorrect_answers}
            </p>

            <p>
              <strong>
                Unanswered:
              </strong>{" "}
              {result.unanswered}
            </p>

            <p>
              <strong>
                Time Taken:
              </strong>{" "}
              {result.time_taken} seconds
            </p>

            <h2>
              {result.status === "PASSED"
                ? "Passed"
                : "Failed"}
            </h2>
          </div>

          <br />

          <button
            onClick={handleBack}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Back to Quizzes
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentQuiz;