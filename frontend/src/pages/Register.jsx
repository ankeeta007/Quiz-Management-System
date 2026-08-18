import React, { useState } from "react";

function Register() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/register/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            name: name.trim(),
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "REGISTER RESPONSE:",
        data
      );

      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      if (!response.ok) {
        let message =
          "Registration failed.";

        if (data.detail) {
          message = data.detail;
        } else if (data.error) {
          message = data.error;
        } else if (
          typeof data === "object"
        ) {
          const messages =
            Object.entries(data)
              .map(
                ([field, value]) => {
                  if (Array.isArray(value)) {
                    return `${field}: ${value.join(
                      ", "
                    )}`;
                  }

                  return `${field}: ${value}`;
                }
              )
              .join(" ");

          if (messages) {
            message = messages;
          }
        }

        throw new Error(message);
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      alert(
        "Registration successful!"
      );

      setUsername("");
      setName("");
      setEmail("");
      setPassword("");

      // Go to login
      window.location.href = "/login";

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          LEFT BRAND SECTION
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
            Quiz Management & Online
            Assessment Platform
          </p>

          <div style={styles.featureList}>

            <div style={styles.feature}>

              <span style={styles.featureIcon}>
                📝
              </span>

              <div>
                <strong>
                  Take Quizzes
                </strong>

                <p>
                  Test your knowledge with
                  online assessments.
                </p>
              </div>

            </div>

            <div style={styles.feature}>

              <span style={styles.featureIcon}>
                📊
              </span>

              <div>
                <strong>
                  Track Results
                </strong>

                <p>
                  View your scores and quiz
                  performance.
                </p>
              </div>

            </div>

            <div style={styles.feature}>

              <span style={styles.featureIcon}>
                🏆
              </span>

              <div>
                <strong>
                  Improve Your Skills
                </strong>

                <p>
                  Practice quizzes and improve
                  your performance.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          REGISTER SECTION
      ================================================= */}

      <div style={styles.registerSection}>

        <div style={styles.registerCard}>

          {/* HEADER */}

          <div style={styles.registerHeader}>

            <div style={styles.mobileLogo}>
              Q
            </div>

            <h2 style={styles.registerTitle}>
              Create Account
            </h2>

            <p style={styles.registerSubtitle}>
              Join the Quiz Platform
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleRegister}>

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
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  style={styles.input}
                  disabled={loading}
                />

              </div>

              <p style={styles.hint}>
                This will be used to log in.
              </p>

            </div>

            {/* FULL NAME */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Full Name
              </label>

              <div style={styles.inputWrapper}>

                <span style={styles.inputIcon}>
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  style={styles.input}
                  disabled={loading}
                />

              </div>

            </div>

            {/* EMAIL */}

            <div style={styles.formGroup}>

              <label style={styles.label}>
                Email Address
              </label>

              <div style={styles.inputWrapper}>

                <span style={styles.inputIcon}>
                  ✉️
                </span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  style={styles.input}
                  disabled={loading}
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  style={styles.input}
                  disabled={loading}
                />

              </div>

              <p style={styles.hint}>
                Password must contain at
                least 6 characters.
              </p>

            </div>

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.registerButton,
                ...(loading
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* LOGIN */}

          <div style={styles.loginSection}>

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/login")
              }
              style={styles.loginButton}
              disabled={loading}
            >
              Login
            </button>

          </div>

          {/* FOOTER */}

          <p style={styles.footer}>
            Quiz Management & Online
            Assessment Platform
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
    width: "100%",
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

  registerSection: {
    width: "50%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    boxSizing: "border-box",
  },

  registerCard: {
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

  registerHeader: {
    textAlign: "center",
    marginBottom: "28px",
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

  registerTitle: {
    margin: "0 0 8px 0",
    color: "#111827",
    fontSize: "28px",
  },

  registerSubtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  errorBox: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  formGroup: {
    marginBottom: "18px",
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

  hint: {
    margin: "5px 0 0 0",
    color: "#9ca3af",
    fontSize: "11px",
  },

  registerButton: {
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

  loginSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "25px",
    color: "#6b7280",
    fontSize: "13px",
  },

  loginButton: {
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
    borderTop:
      "1px solid #e5e7eb",
    color: "#9ca3af",
    fontSize: "11px",
  },
};

export default Register;