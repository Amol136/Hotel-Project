import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

function MainAdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: "➕",
      title: "CREATE SUB ADMIN",
      description: "नवीन Sub Admin account तयार करा.",
      action: "ADD SUB ADMIN →",
      path: "/main-admin/create-sub-admin",
      className: "main-card-blue",
    },
    {
      icon: "🏢",
      title: "SUB ADMIN LIST",
      description: "सर्व Sub Admin accounts manage करा.",
      action: "VIEW SUB ADMINS →",
      path: "/main-admin/sub-admins",
      className: "main-card-green",
    },
    {
      icon: "👥",
      title: "ALL MANAGERS",
      description: "सर्व Sub Admin अंतर्गत असलेले Managers पहा.",
      action: "VIEW MANAGERS →",
      path: "/main-admin/managers",
      className: "main-card-purple",
    },
    {
      icon: "🪪",
      title: "ALL CUSTOMER ID PHOTOS",
      description: "सर्व Managers चे Customer ID records पहा.",
      action: "VIEW CUSTOMER IDs →",
      path: "/main-admin/customer-photos",
      className: "main-card-orange",
    },
    {
      icon: "📷",
      title: "ALL REGISTER PHOTOS",
      description: "सर्व Managers चे Register Photos पहा.",
      action: "VIEW REGISTER PHOTOS →",
      path: "/main-admin/register-photos",
      className: "main-card-red",
    },
  ];

  return (
    <div className="main-admin-page">

      <nav className="main-admin-navbar">

        <div className="main-admin-brand">

          <div className="main-admin-logo">
            MA
          </div>

          <div>
            <h2>MAIN ADMIN</h2>
            <span>PHOTO MANAGEMENT SYSTEM</span>
          </div>

        </div>

        <div className="main-admin-nav-right">

          <span className="main-admin-badge">
            MAIN ADMIN
          </span>

          <button
            className="main-admin-logout"
            onClick={() => navigate("/login")}
          >
            EXIT SYSTEM →
          </button>

        </div>

      </nav>

      <main className="main-admin-container">

        <section className="main-admin-heading">

          <span>SYSTEM CONTROL PANEL</span>

          <h1>
            Main Admin <b>Dashboard</b>
          </h1>

          <p>
            Sub Admin, Managers आणि सर्व Photo Records
            manage करा.
          </p>

        </section>

        <section className="main-admin-grid">

          {cards.map((card) => (
            <div
              key={card.title}
              className={`main-dashboard-card ${card.className}`}
              onClick={() => navigate(card.path)}
            >

              <div className="main-card-icon">
                {card.icon}
              </div>

              <h2>{card.title}</h2>

              <p>{card.description}</p>

              <button type="button">
                {card.action}
              </button>

            </div>
          ))}

        </section>

        <section className="main-admin-status">

          <div>
            <span className="main-mode-badge">
              MAIN ADMIN MODE
            </span>

            <small>
              FULL SYSTEM ACCESS
            </small>
          </div>

          <div className="main-system-online">
            <i></i>
            SYSTEM ONLINE
          </div>

        </section>

      </main>

    </div>
  );
}

export default MainAdminDashboard;