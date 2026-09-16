import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

function SubAdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 1,
      icon: "➕",
      title: "CREATE MANAGER",
      description:
        "नवीन Manager account तयार करा आणि त्याला login access द्या.",
      action: "ADD MANAGER →",
      className: "sub-card-blue",
      path: "/sub-admin/create-manager",
    },
    {
      id: 2,
      icon: "👥",
      title: "MANAGER LIST",
      description:
        "तुम्ही तयार केलेले Managers पहा, Edit किंवा Delete करा.",
      action: "VIEW MANAGERS →",
      className: "sub-card-green",
      path: "/sub-admin/managers",
    },
    {
      id: 3,
      icon: "🪪",
      title: "CUSTOMER ID PHOTOS",
      description:
        "तुमच्या Managers ने Upload केलेले Customer ID records पहा.",
      action: "VIEW CUSTOMER IDs →",
      className: "sub-card-purple",
      path: "/sub-admin/customer-photos",
    },
    {
      id: 4,
      icon: "📷",
      title: "REGISTER PHOTOS",
      description:
        "तुमच्या Managers ने Upload केलेले daily Register Photos पहा.",
      action: "VIEW REGISTER PHOTOS →",
      className: "sub-card-orange",
      path: "/sub-admin/register-photos",
    },
  ];

  return (
    <div className="sub-admin-page">

      {/* NAVBAR */}

      <nav className="sub-admin-navbar">

        <div className="sub-admin-brand">

          <div className="sub-admin-logo">
            SA
          </div>

          <div>
            <h2>SUB ADMIN</h2>
            <span>PHOTO MANAGEMENT</span>
          </div>

        </div>

        <div className="sub-admin-nav-right">

          <div className="sub-admin-role">
            SUB ADMIN
          </div>

          <button
            className="sub-admin-logout"
            onClick={() => navigate("/login")}
          >
            EXIT SYSTEM →
          </button>

        </div>

      </nav>

      {/* MAIN */}

      <main className="sub-admin-container">

        {/* HEADING */}

        <section className="sub-admin-heading">

          <div className="sub-heading-line">
            MANAGEMENT PANEL
          </div>

          <h1>
            Sub Admin <span>Dashboard</span>
          </h1>

          <p>
            Managers आणि त्यांच्या Photo Records चे
            management करा.
          </p>

        </section>

        {/* CARDS */}

        <section className="sub-admin-grid">

          {cards.map((card) => (

            <div
              key={card.id}
              className={`sub-dashboard-card ${card.className}`}
              onClick={() => navigate(card.path)}
            >

              <div className="sub-card-icon">
                {card.icon}
              </div>

              <h2>
                {card.title}
              </h2>

              <p>
                {card.description}
              </p>

              <button
                type="button"
                className="sub-card-action"
              >
                {card.action}
              </button>

            </div>

          ))}

        </section>

        {/* BOTTOM */}

        <section className="sub-admin-footer-status">

          <div>
            <span className="sub-mode-badge">
              SUB ADMIN MODE
            </span>

            <span className="sub-access-text">
              MANAGER DATA ACCESS
            </span>
          </div>

          <div className="sub-online-status">
            <span></span>
            SYSTEM ONLINE
          </div>

        </section>

      </main>

    </div>
  );
}

export default SubAdminDashboard;