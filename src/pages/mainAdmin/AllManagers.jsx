import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function AllManagers() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [managers] = useState(() => {
    return JSON.parse(localStorage.getItem("managers")) || [];
  });

  const [subAdmins] = useState(() => {
    return JSON.parse(localStorage.getItem("subAdmins")) || [];
  });

  const getSubAdmin = (subAdminId) => {
    return subAdmins.find(
      (item) =>
        item.subAdminId?.toLowerCase() ===
        subAdminId?.toLowerCase()
    );
  };

  const text = search.toLowerCase().trim();

  const filteredManagers = managers.filter((manager) => {
    const subAdmin = getSubAdmin(
      manager.createdBySubAdminId
    );

    const matchesSearch =
      !text ||
      manager.managerName
        ?.toLowerCase()
        .includes(text) ||
      manager.managerId
        ?.toLowerCase()
        .includes(text) ||
      manager.mobile
        ?.toString()
        .includes(text) ||
      manager.email
        ?.toLowerCase()
        .includes(text) ||
      subAdmin?.name
        ?.toLowerCase()
        .includes(text) ||
      subAdmin?.propertyName
        ?.toLowerCase()
        .includes(text);

    const matchesStatus =
      statusFilter === "ALL" ||
      manager.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="all-managers-page">

      <header className="all-managers-header">
        <div>
          <span>MAIN ADMIN / MANAGERS</span>

          <h1>All Managers</h1>

          <p>
            सर्व Sub Admin अंतर्गत असलेले Managers
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/main-admin/dashboard")
          }
        >
          ← DASHBOARD
        </button>
      </header>

      <main className="all-managers-container">

        {/* SUMMARY */}

        <section className="all-managers-summary">

          <div>
            <small>TOTAL MANAGERS</small>
            <strong>{managers.length}</strong>
          </div>

          <div className="all-manager-active">
            <small>ACTIVE</small>

            <strong>
              {
                managers.filter(
                  (item) => item.status === "ACTIVE"
                ).length
              }
            </strong>
          </div>

          <div className="all-manager-inactive">
            <small>INACTIVE</small>

            <strong>
              {
                managers.filter(
                  (item) => item.status === "INACTIVE"
                ).length
              }
            </strong>
          </div>

          <div className="all-manager-subadmins">
            <small>SUB ADMINS</small>
            <strong>{subAdmins.length}</strong>
          </div>

        </section>

        {/* SEARCH + FILTER */}

        <section className="all-managers-toolbar">

          <div>
            <h2>Manager Accounts</h2>

            <p>
              Manager, Sub Admin किंवा Property ने
              search करा
            </p>
          </div>

          <div className="all-manager-filters">

            <input
              type="text"
              placeholder="Search manager..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

          </div>

        </section>

        {/* TABLE */}

        <section className="all-managers-table-card">

          {filteredManagers.length === 0 ? (

            <div className="all-managers-empty">

              <div>👥</div>

              <h3>
                Manager सापडला नाही
              </h3>

              <p>
                Sub Admin ने Manager तयार केल्यानंतर
                येथे दिसेल.
              </p>

            </div>

          ) : (

            <div className="all-managers-table-wrapper">

              <table className="all-managers-table">

                <thead>
                  <tr>
                    <th>SR.</th>
                    <th>MANAGER</th>
                    <th>MANAGER ID</th>
                    <th>SUB ADMIN</th>
                    <th>PROPERTY</th>
                    <th>MOBILE</th>
                    <th>EMAIL</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredManagers.map(
                    (manager, index) => {

                      const subAdmin = getSubAdmin(
                        manager.createdBySubAdminId
                      );

                      return (
                        <tr key={manager.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>

                            <div className="all-manager-name">

                              <div className="all-manager-avatar">
                                {manager.managerName
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>

                              <strong>
                                {manager.managerName}
                              </strong>

                            </div>

                          </td>

                          <td>

                            <span className="all-manager-id">
                              {manager.managerId}
                            </span>

                          </td>

                          <td>
                            {subAdmin?.name ||
                              manager.createdBySubAdminId ||
                              "-"}
                          </td>

                          <td>
                            <strong>
                              {subAdmin?.propertyName ||
                                "-"}
                            </strong>
                          </td>

                          <td>
                            {manager.mobile}
                          </td>

                          <td>
                            {manager.email}
                          </td>

                          <td>

                            <span
                              className={
                                manager.status === "ACTIVE"
                                  ? "all-manager-status active"
                                  : "all-manager-status inactive"
                              }
                            >
                              {manager.status}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AllManagers;