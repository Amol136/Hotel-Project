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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const subAdmins =
      JSON.parse(localStorage.getItem("subAdmins")) || [];

    const subAdmin = subAdmins.find(
      (item) =>
        item.email?.trim().toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (!subAdmin) {
      setError("Invalid Email ID or Password.");
      return;
    }

    if (subAdmin.status === "INACTIVE") {
      setError("Your account is inactive.");
      return;
    }

    if (subAdmin.password !== password) {
      setError("Invalid Email ID or Password.");
      return;
    }

    login({
      id: subAdmin.id,
      subAdminId: subAdmin.subAdminId,
      name: subAdmin.name,
      email: subAdmin.email,
      propertyName: subAdmin.propertyName,
      role: "SUB_ADMIN",
    });

    navigate("/sub-admin/dashboard", { replace: true });
  };

  return (
    <div className="role-login-page">
      <div className="role-login-card">
        <div className="role-login-badge">SUB ADMIN</div>

        <h1>SUB ADMIN LOGIN</h1>
        <p>Enter your Email ID and Password.</p>

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
            SUB ADMIN LOGIN →
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubAdminLogin;