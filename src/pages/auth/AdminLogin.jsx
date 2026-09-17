import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (
      userId.trim() === "admin" &&
      password === "admin123"
    ) {
      login({
        id: "MAIN-ADMIN-001",
        name: "Main Admin",
        role: "MAIN_ADMIN",
      });

      navigate("/main-admin/dashboard", {
        replace: true,
      });

      return;
    }

    setError("Admin ID किंवा Password चुकीचा आहे.");
  };

  return (
    <div className="role-login-page">
      <div className="role-login-card">

        <div className="role-login-badge">
          ADMIN
        </div>

        <h1>ADMIN LOGIN</h1>

        <p>
          Main Admin Control Panel मध्ये प्रवेश करा
        </p>

        <form onSubmit={handleSubmit}>

          <div className="role-login-group">
            <label>ADMIN ID</label>

            <input
              type="text"
              placeholder="Enter Admin ID"
              value={userId}
              onChange={(e) =>
                setUserId(e.target.value)
              }
              autoComplete="username"
            />
          </div>

          <div className="role-login-group">
            <label>PASSWORD</label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="role-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="role-login-submit"
          >
            ADMIN LOGIN →
          </button>

        </form>

        <div className="role-login-switch">
          <button
            type="button"
            onClick={() =>
              navigate("/login/sub-admin")
            }
          >
            Sub Admin Login
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/login/manager")
            }
          >
            Manager Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;