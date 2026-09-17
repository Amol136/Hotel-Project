import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      email.trim().toLowerCase() === "admin@test.com" &&
      password === "admin123"
    ) {
      login({
        id: "MAIN-ADMIN-001",
        name: "Main Admin",
        email: "admin@test.com",
        role: "MAIN_ADMIN",
      });

      navigate("/main-admin/dashboard", { replace: true });
      return;
    }

    setError("Invalid Email ID or Password.");
  };

  return (
    <div className="role-login-page">
      <div className="role-login-card">
        <div className="role-login-badge">ADMIN</div>

        <h1>ADMIN LOGIN</h1>
        <p>Enter your Admin Email ID and Password.</p>

        <form onSubmit={handleSubmit}>
          <div className="role-login-group">
            <label>EMAIL ID</label>
            <input
              type="email"
              placeholder="Enter Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="role-login-group">
            <label>PASSWORD</label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div className="role-login-error">{error}</div>
          )}

          <button type="submit" className="role-login-submit">
            ADMIN LOGIN →
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;