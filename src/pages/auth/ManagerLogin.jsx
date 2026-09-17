import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function ManagerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [managerId, setManagerId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const managers =
      JSON.parse(
        localStorage.getItem("managers")
      ) || [];

    const enteredId =
      managerId.trim().toUpperCase();

    const manager = managers.find(
      (item) =>
        item.managerId?.toUpperCase() ===
          enteredId &&
        item.password === password
    );

    if (!manager) {
      setError(
        "Manager ID किंवा Password चुकीचा आहे."
      );
      return;
    }

    if (manager.status === "INACTIVE") {
      setError(
        "हा Manager account Inactive आहे."
      );
      return;
    }

    login({
      id: manager.id,
      managerId: manager.managerId,
      name: manager.managerName,
      subAdminId:
        manager.createdBySubAdminId,
      role: "MANAGER",
    });

    navigate(
      "/manager/dashboard",
      { replace: true }
    );
  };

  return (
    <div className="role-login-page">

      <div className="role-login-card">

        <div className="role-login-badge">
          MANAGER
        </div>

        <h1>MANAGER LOGIN</h1>

        <p>
          Customer ID आणि Register Photos manage करा
        </p>

        <form onSubmit={handleSubmit}>

          <div className="role-login-group">

            <label>
              MANAGER ID
            </label>

            <input
              type="text"
              placeholder="Enter Manager ID"
              value={managerId}
              onChange={(e) =>
                setManagerId(
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
            MANAGER LOGIN →
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
              navigate("/login/sub-admin")
            }
          >
            Sub Admin Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default ManagerLogin;