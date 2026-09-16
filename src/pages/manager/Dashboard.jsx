import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">

      <header className="top-navbar">

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

        <div className="navbar-right">
          <button className="language-button">
            मराठी
          </button>

          <button
            className="logout-button"
            onClick={() => navigate("/login")}
          >
            EXIT SYSTEM →
          </button>
        </div>

      </header>

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
            onClick={() => navigate("/manager/customer-id")}
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
            onClick={() => navigate("/manager/register-photo")}
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