import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    // Temporary login
    // Spring Boot backend आल्यावर हे काढू.
    if (email === "manager@test.com" && password === "1234") {
      navigate("/manager/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>MANAGER LOGIN</h1>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>EMAIL ADDRESS</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            ENTER DASHBOARD
          </button>

        </form>

        <div className="demo-login">
          Demo: manager@test.com / 1234
        </div>

      </div>
    </div>
  );
}

export default Login;