import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import QuizManagement from "./pages/QuizManagement";
import CategoryManagement from "./pages/CategoryManagement";
import QuestionManagement from "./pages/QuestionManagement";
import AdminAttempts from "./pages/AdminAttempts";
import AdminResult from "./pages/AdminResult";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import StudentQuiz from "./pages/StudentQuiz";
import StudentResult from "./pages/StudentResult";
import StudentHistory from "./pages/StudentHistory";
import StudentReview from "./pages/StudentReview";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            ADMIN LAYOUT
        ================================================= */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* ADMIN DASHBOARD */}

          <Route
            index
            element={<AdminDashboard />}
          />

          {/* USERS */}

          <Route
            path="users"
            element={<UserManagement />}
          />

          {/* CATEGORIES */}

          <Route
            path="categories"
            element={<CategoryManagement />}
          />

          {/* QUIZZES */}

          <Route
            path="quizzes"
            element={<QuizManagement />}
          />

          {/* QUESTIONS */}

          <Route
            path="questions"
            element={<QuestionManagement />}
          />

          {/* STUDENT ATTEMPTS */}

          <Route
            path="attempts"
            element={<AdminAttempts />}
          />

          {/* STUDENT RESULT */}

          <Route
            path="result/:attemptId"
            element={<AdminResult />}
          />

        </Route>

        {/* =================================================
            STUDENT LAYOUT
        ================================================= */}

        <Route
          path="/student"
          element={<StudentLayout />}
        >

          {/* STUDENT DASHBOARD */}

          <Route
            index
            element={<StudentDashboard />}
          />

          <Route
            path="dashboard"
            element={<StudentDashboard />}
          />

          {/* TAKE QUIZ */}

          <Route
            path="quiz"
            element={<StudentQuiz />}
          />

          {/* RESULT */}

          <Route
            path="result/:attemptId"
            element={<StudentResult />}
          />

          {/* HISTORY */}

          <Route
            path="history"
            element={<StudentHistory />}
          />

          {/* REVIEW */}

          <Route
            path="review/:attemptId"
            element={<StudentReview />}
          />

          {/* LEADERBOARD */}

          <Route
            path="leaderboard"
            element={<Leaderboard />}
          />

        </Route>

        {/* =================================================
            NOT FOUND
        ================================================= */}

        <Route
          path="*"
          element={<Login />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;