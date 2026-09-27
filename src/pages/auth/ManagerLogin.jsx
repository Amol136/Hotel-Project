import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function ManagerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // MANAGER LOGIN USING SPRING BOOT + JWT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
            "Invalid Email ID or Password."
        );
      }

      const data = await response.json();

      // ======================================
      // ROLE CHECK
      // ======================================

      if (data.role !== "MANAGER") {
        setError(
          "This login is only for Manager."
        );

        return;
      }

      // ======================================
      // JWT TOKEN CHECK
      // ======================================

      if (!data.token) {
        throw new Error(
          "Authentication token मिळाला नाही."
        );
      }

      // ======================================
      // SAVE USER + JWT IN AUTH CONTEXT
      // ======================================

      login({
        // PostgreSQL Manager database ID
        id: data.id,

        // Example: MGR-001
        managerId: data.userId,

        // Keep backend userId also
        userId: data.userId,

        name: data.name,

        email: data.email,

        // PostgreSQL parent Sub Admin ID
        subAdminId: data.createdBySubAdminId,

        role: data.role,

        // JWT TOKEN
        token: data.token,
      });

      // ======================================
      // MANAGER DASHBOARD
      // ======================================

      navigate(
        "/manager/dashboard",
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(
        "Manager Login Error:",
        error
      );

      if (error.message === "Failed to fetch") {
        setError(
          "Backend server is not running."
        );
      } else {
        setError(
          error.message ||
            "Login करताना error आला."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-login-page">

      <div className="role-login-card">

        <div className="role-login-badge">
          MANAGER
        </div>

        <h1>
          MANAGER LOGIN
        </h1>

        <p>
          Enter your Email ID and Password.
        </p>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="role-login-group">

            <label>
              EMAIL ID
            </label>

            <input
              type="email"
              placeholder="Enter Email ID"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="role-login-group">

            <label>
              PASSWORD
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-eye-btn"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁"}
              </button>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="role-login-error">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="role-login-submit"
            disabled={loading}
          >
            {loading
              ? "LOGIN होत आहे..."
              : "MANAGER LOGIN →"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default ManagerLogin;