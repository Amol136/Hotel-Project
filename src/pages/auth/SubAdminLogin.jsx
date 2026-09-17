import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function SubAdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [subAdminId, setSubAdminId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const subAdmins =
      JSON.parse(
        localStorage.getItem("subAdmins")
      ) || [];

    const enteredId =
      subAdminId.trim().toUpperCase();

    const subAdmin = subAdmins.find(
      (item) =>
        item.subAdminId?.toUpperCase() ===
          enteredId &&
        item.password === password
    );

    if (!subAdmin) {
      setError(
        "Sub Admin ID किंवा Password चुकीचा आहे."
      );
      return;
    }

    if (subAdmin.status === "INACTIVE") {
      setError(
        "हा Sub Admin account Inactive आहे."
      );
      return;
    }

    login({
      id: subAdmin.id,
      subAdminId: subAdmin.subAdminId,
      name: subAdmin.name,
      propertyName: subAdmin.propertyName,
      role: "SUB_ADMIN",
    });

    navigate(
      "/sub-admin/dashboard",
      { replace: true }
    );
  };

  return (
    <div className="role-login-page">

      <div className="role-login-card">

        <div className="role-login-badge">
          SUB ADMIN
        </div>

        <h1>SUB ADMIN LOGIN</h1>

        <p>
          Manager आणि Photo Records manage करा
        </p>

        <form onSubmit={handleSubmit}>

          <div className="role-login-group">

            <label>
              SUB ADMIN ID
            </label>

            <input
              type="text"
              placeholder="Enter Sub Admin ID"
              value={subAdminId}
              onChange={(e) =>
                setSubAdminId(
                  e.target.value
                )
              }
              autoComplete="username"
            />

          </div>

          <div className="role-login-group">

            <label>
              PASSWORD
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
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
            SUB ADMIN LOGIN →
          </button>

        </form>

        <div className="role-login-switch">

          <button
            type="button"
            onClick={() =>
              navigate("/login/admin")
            }
          >
            Admin Login
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

export default SubAdminLogin;