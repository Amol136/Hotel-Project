import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">

      <nav className="top-navbar">

        <div className="brand">
          <div className="brand-box">PMS</div>

          <div>
            <div className="brand-title">
              Photo Management
            </div>

            <div className="brand-subtitle">
              INTERNAL MANAGEMENT
            </div>
          </div>
        </div>

        <div className="manager-nav-right">
          <span>
            Welcome, {user?.name || "Manager"}
          </span>

          <button
            className="dashboard-logout-button"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </div>

      </nav>

      <main className="dashboard-container">

        <section className="dashboard-heading">
          <h1>
            Manager <span>Dashboard</span>
          </h1>

          <p>
            Welcome back. Select an operational module
            to begin your work.
          </p>
        </section>

        <section className="dashboard-cards">

          <div
            className="dashboard-card customer-card"
            onClick={() =>
              navigate("/manager/customer-id")
            }
          >
            <div className="card-icon">
              🪪
            </div>

            <h2>CUSTOMER ID</h2>

            <p>
              Upload customer ID documents and verify or
              edit existing records.
            </p>

            <span className="card-link">
              UPLOAD / VERIFY / EDIT →
            </span>
          </div>

          <div
            className="dashboard-card register-card"
            onClick={() =>
              navigate("/manager/register-photo")
            }
          >
            <div className="card-icon">
              📷
            </div>

            <h2>REGISTER PHOTO</h2>

            <p>
              Upload a clear photo of the daily register.
            </p>

            <span className="card-link">
              UPLOAD PHOTO →
            </span>
          </div>

        </section>

        <div className="dashboard-footer">

          <div>
            <small>ROLE</small>
            <strong>MANAGER</strong>
          </div>

          <div className="online-status">
            ● SYSTEM ONLINE
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;