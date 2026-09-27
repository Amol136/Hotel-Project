import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function SubAdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        const message = await response.text();

        throw new Error(
          message || "Invalid Email ID or Password."
        );
      }

      const data = await response.json();

      // Only Sub Admin can login from this page
      if (data.role !== "SUB_ADMIN") {
        setError(
          "This login is only for Sub Admin."
        );
        return;
      }

      // JWT token must be present
      if (!data.token) {
        throw new Error(
          "Authentication token मिळाला नाही."
        );
      }

      // Save Sub Admin + JWT token
      login({
        id: data.id,

        // Backend userId = Frontend subAdminId
        subAdminId: data.userId,

        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,

        // JWT
        token: data.token,
      });

      navigate(
        "/sub-admin/dashboard",
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "Sub Admin login error:",
        err
      );

      if (err.message === "Failed to fetch") {
        setError(
          "Backend server is not running."
        );
      } else {
        setError(
          err.message ||
            "Invalid Email ID or Password."
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
          SUB ADMIN
        </div>

        <h1>SUB ADMIN LOGIN</h1>

        <p>
          Enter your Email ID and Password.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="role-login-group">

            <label>EMAIL ID</label>

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

          <div className="role-login-group">

            <label>PASSWORD</label>

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

          {error && (
            <div className="role-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="role-login-submit"
            disabled={loading}
          >
            {loading
              ? "LOGGING IN..."
              : "SUB ADMIN LOGIN →"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default SubAdminLogin;