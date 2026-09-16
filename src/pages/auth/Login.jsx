import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    const enteredId = userId.trim();
    const enteredPassword = password.trim();

    if (!enteredId || !enteredPassword) {
      setMessage("User ID आणि Password भरा.");
      return;
    }

    // TEMPORARY MAIN ADMIN LOGIN
    if (
      enteredId.toLowerCase() === "admin" &&
      enteredPassword === "admin123"
    ) {
      login({
        id: "MAIN-ADMIN-001",
        name: "Main Admin",
        role: "MAIN_ADMIN",
      });

      navigate("/main-admin/dashboard");
      return;
    }

    // SUB ADMIN LOGIN
    const subAdmins =
      JSON.parse(localStorage.getItem("subAdmins")) || [];

    const subAdmin = subAdmins.find(
      (item) =>
        item.subAdminId?.toLowerCase() ===
          enteredId.toLowerCase() &&
        item.password === enteredPassword &&
        item.status !== "INACTIVE"
    );

    if (subAdmin) {
      login({
        id: subAdmin.id,
        subAdminId: subAdmin.subAdminId,
        name: subAdmin.name,
        propertyName: subAdmin.propertyName,
        role: "SUB_ADMIN",
      });

      navigate("/sub-admin/dashboard");
      return;
    }

    // MANAGER LOGIN
    const managers =
      JSON.parse(localStorage.getItem("managers")) || [];

    const manager = managers.find(
      (item) =>
        item.managerId?.toLowerCase() ===
          enteredId.toLowerCase() &&
        item.password === enteredPassword &&
        item.status !== "INACTIVE"
    );

    if (manager) {
      login({
        id: manager.id,
        managerId: manager.managerId,
        name: manager.managerName,
        subAdminId: manager.createdBySubAdminId,
        role: "MANAGER",
      });

      navigate("/manager/dashboard");
      return;
    }

    setMessage("User ID किंवा Password चुकीचा आहे.");
  };

  return (
    <div className="role-login-page">
      <div className="role-login-card">

        <div className="role-login-logo">
          HMS
        </div>

        <p className="role-login-label">
          PHOTO MANAGEMENT SYSTEM
        </p>

        <h1>Login</h1>

        <p className="role-login-subtitle">
          Main Admin, Sub Admin किंवा Manager Login
        </p>

        <form onSubmit={handleLogin}>

          <div className="role-login-field">
            <label>USER ID</label>

            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
                setMessage("");
              }}
            />
          </div>

          <div className="role-login-field">
            <label>PASSWORD</label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
            />
          </div>

          {message && (
            <div className="role-login-error">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="role-login-button"
          >
            LOGIN
          </button>

        </form>

        <p className="role-login-note">
          Secure Photo Management
        </p>

      </div>
    </div>
  );
}

export default Login;