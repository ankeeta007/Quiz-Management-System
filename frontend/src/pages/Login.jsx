import React, { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

console.log("API BASE URL:", API_BASE_URL);



function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // =================================================
      // LOGIN
      // =================================================

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGIN STATUS:", response.status);
      console.log("LOGIN RESPONSE:", data);


      if (!response.ok) {
        setError(
          data.detail ||
            data.error ||
            "Invalid username or password."
        );

        setLoading(false);
        return;
      }

      // =================================================
      // SAVE JWT TOKENS
      // =================================================

      localStorage.setItem(
        "access_token",
        data.access
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh
      );

      // =================================================
      // GET CURRENT USER
      // =================================================

      const userResponse = await fetch(
        `${API_BASE_URL}/api/auth/me/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userData = await userResponse.json();

      console.log(
        "CURRENT USER RESPONSE:",
        userData
      );

      if (!userResponse.ok) {
        throw new Error(
          userData.detail ||
            userData.error ||
            "Unable to get user information."
        );
      }

      // =================================================
      // SAVE USER
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      // =================================================
      // DETERMINE USER ROLE
      // =================================================

      const isAdmin =
        userData.is_staff === true ||
        userData.is_superuser === true ||
        userData.role === "ADMIN" ||
        userData.role === "admin" ||
        userData.role === "Admin";

      console.log(
        "USER IS ADMIN:",
        isAdmin
      );

      // =================================================
      // REDIRECT
      // =================================================

      if (isAdmin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/student";
      }

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
          "Cannot connect to the backend. Please make sure the Django server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* =================================================
          BRAND SECTION
      ================================================= */}

      <div style={styles.brandSection}>

        <div style={styles.brandContent}>

          <div style={styles.logo}>
            Q
          </div>

          <h1 style={styles.brandTitle}>
            Quiz Platform
          </h1>

          <p style={styles.brandSubtitle}>
            Quiz Management & Online Assessment Platform
          </p>

          <div style={styles.featureList}>

            <div style={styles.feature}>
              <span style={styles.featureIcon}>
                📝
              </span>

              <div>
                <strong>
                  Manage Quizzes
                </strong>

                <p>
                  Create and manage quizzes easily.
                </p>
              </div>
            </div>

            <div style={styles.feature}>
              <span style={styles.featureIcon}>
                ❓
              </span>

              <div>
                <strong>
                  Manage Questions
                </strong>

                <p>
                  Add questions and answer options.
                </p>
              </div>
            </div>

            <div style={styles.feature}>
              <span style={styles.featureIcon}>
                📊
              </span>

              <div>
                <strong>
                  Track Performance
                </strong>

                <p>
                  Monitor student attempts and results.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          LOGIN SECTION
      ================================================= */}

      <div style={styles.loginSection}>

        <div style={styles.loginCard}>

          {/* HEADER */}

          <div style={styles.loginHeader}>

            <div style={styles.mobileLogo}>
              Q
            </div>

            <h2 style={styles.loginTitle}>
              Welcome Back
            </h2>

            <p style={styles.loginSubtitle}>
              Sign in to your Quiz Platform account
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div style={styles.errorBox}>

              <span style={styles.errorIcon}>
                ⚠
              </span>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleLogin}>

            {/* USERNAME */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Username
              </label>

              <div style={styles.inputWrapper}>

                <span style={styles.inputIcon}>
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  style={styles.input}
                  autoComplete="username"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Password
              </label>

              <div style={styles.inputWrapper}>

                <span style={styles.inputIcon}>
                  🔒
                </span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  style={styles.input}
                  autoComplete="current-password"
                  required
                />

              </div>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.loginButton,
                ...(loading
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

          </form>

          {/* REGISTER */}

          <div style={styles.registerSection}>

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/register";
              }}
              style={styles.registerButton}
            >
              Create Account
            </button>

          </div>

          {/* FOOTER */}

          <p style={styles.footer}>
            Quiz Management & Online Assessment Platform
          </p>

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
    display: "flex",
    backgroundColor: "#f5f7fb",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  brandSection: {
    width: "50%",
    minHeight: "100vh",
    background:
      "linear-gradient(145deg, #111827 0%, #172554 55%, #2563eb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "50px",
    boxSizing: "border-box",
    color: "#ffffff",
  },

  brandContent: {
    maxWidth: "500px",
  },

  logo: {
    width: "70px",
    height: "70px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #2563eb, #60a5fa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: "bold",
    marginBottom: "25px",
    boxShadow:
      "0 10px 30px rgba(37,99,235,0.35)",
  },

  brandTitle: {
    fontSize: "42px",
    margin: "0 0 12px 0",
    letterSpacing: "-1px",
  },

  brandSubtitle: {
    fontSize: "17px",
    lineHeight: "1.6",
    color: "#cbd5e1",
    margin: "0 0 40px 0",
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  feature: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
  },

  featureIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor:
      "rgba(255,255,255,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    flexShrink: 0,
  },

  loginSection: {
    width: "50%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    boxSizing: "border-box",
  },

  loginCard: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    boxSizing: "border-box",
    boxShadow:
      "0 10px 40px rgba(15,23,42,0.10)",
    border: "1px solid #e5e7eb",
  },

  loginHeader: {
    textAlign: "center",
    marginBottom: "30px",
  },

  mobileLogo: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 auto 18px auto",
  },

  loginTitle: {
    margin: "0 0 8px 0",
    color: "#111827",
    fontSize: "28px",
  },

  loginSubtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  errorIcon: {
    flexShrink: 0,
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "13px",
    fontSize: "16px",
    zIndex: 1,
  },

  input: {
    width: "100%",
    padding: "13px 14px 13px 42px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    color: "#1f2937",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },

  loginButton: {
    width: "100%",
    padding: "13px 20px",
    marginTop: "5px",
    border: "none",
    borderRadius: "8px",
    background:
      "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow:
      "0 5px 15px rgba(37,99,235,0.25)",
  },

  disabledButton: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  registerSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "25px",
    color: "#6b7280",
    fontSize: "13px",
    flexWrap: "wrap",
  },

  registerButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#2563eb",
    fontWeight: "bold",
    cursor: "pointer",
    padding: 0,
    fontSize: "13px",
  },

  footer: {
    textAlign: "center",
    margin: "28px 0 0 0",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
    color: "#9ca3af",
    fontSize: "11px",
  },
};

export default Login;