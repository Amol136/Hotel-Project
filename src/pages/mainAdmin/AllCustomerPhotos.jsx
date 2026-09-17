import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function AllCustomerPhotos() {
  const navigate = useNavigate();

  // =========================
  // SEARCH FILTERS
  // =========================
  const [searchDate, setSearchDate] = useState("");
  const [searchSubAdmin, setSearchSubAdmin] = useState("");
  const [searchManager, setSearchManager] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // =========================
  // LOCAL STORAGE DATA
  // =========================
  const [records] = useState(() => {
    return JSON.parse(localStorage.getItem("customerRecords")) || [];
  });

  const [managers] = useState(() => {
    return JSON.parse(localStorage.getItem("managers")) || [];
  });

  const [subAdmins] = useState(() => {
    return JSON.parse(localStorage.getItem("subAdmins")) || [];
  });

  // =========================
  // GET MANAGER
  // =========================
  const getManager = (managerId) => {
    return managers.find(
      (manager) =>
        manager.managerId?.toLowerCase() ===
        managerId?.toLowerCase()
    );
  };

  // =========================
  // GET SUB ADMIN
  // =========================
  const getSubAdmin = (manager) => {
    if (!manager) return null;

    return subAdmins.find(
      (subAdmin) =>
        subAdmin.subAdminId?.toLowerCase() ===
        manager.createdBySubAdminId?.toLowerCase()
    );
  };

  // =========================
  // FILTER RECORDS
  // =========================
  const filteredRecords = records.filter((record) => {
    const manager = getManager(record.managerId);
    const subAdmin = getSubAdmin(manager);

    const dateText = searchDate.trim().toLowerCase();
    const subAdminText = searchSubAdmin.trim().toLowerCase();
    const managerText = searchManager.trim().toLowerCase();

    // SEARCH BY DATE
    const matchesDate =
      !dateText ||
      record.date?.toLowerCase().includes(dateText);

    // SEARCH BY SUB ADMIN
    // Name किंवा Sub Admin ID दोन्ही search होतील
    const matchesSubAdmin =
      !subAdminText ||
      subAdmin?.name?.toLowerCase().includes(subAdminText) ||
      subAdmin?.subAdminId?.toLowerCase().includes(subAdminText);

    // SEARCH BY MANAGER
    // Manager Name किंवा Manager ID दोन्ही search होतील
    const matchesManager =
      !managerText ||
      manager?.managerName?.toLowerCase().includes(managerText) ||
      record.managerId?.toLowerCase().includes(managerText);

    // STATUS FILTER
    const matchesStatus =
      statusFilter === "ALL" ||
      record.status === statusFilter;

    return (
      matchesDate &&
      matchesSubAdmin &&
      matchesManager &&
      matchesStatus
    );
  });

  // =========================
  // VIEW PHOTO
  // =========================
  const handleViewPhoto = (side) => {
    alert(
      `${side} Customer ID Photo Spring Boot + Cloudflare R2 जोडल्यानंतर येथे उघडेल.`
    );
  };

  return (
    <div className="all-customer-page">

      {/* ================= HEADER ================= */}

      <header className="all-customer-header">

        <div>
          <span>MAIN ADMIN / CUSTOMER RECORDS</span>

          <h1>All Customer ID Photos</h1>

          <p>
            सर्व Managers ने Upload केलेले Customer ID records
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

      <main className="all-customer-container">

        {/* ================= SUMMARY ================= */}

        <section className="all-customer-summary">

          <div>
            <small>TOTAL RECORDS</small>
            <strong>{records.length}</strong>
          </div>

          <div className="customer-verified-card">
            <small>VERIFIED</small>

            <strong>
              {
                records.filter(
                  (record) =>
                    record.status === "VERIFIED"
                ).length
              }
            </strong>
          </div>

          <div className="customer-pending-card">
            <small>PENDING</small>

            <strong>
              {
                records.filter(
                  (record) =>
                    record.status === "PENDING"
                ).length
              }
            </strong>
          </div>

          <div className="customer-manager-card">
            <small>MANAGERS</small>
            <strong>{managers.length}</strong>
          </div>

        </section>

        {/* ================= TOOLBAR ================= */}

        <section className="all-customer-toolbar">

          <div>
            <h2>Customer ID Records</h2>

            <p>
              Date, Sub Admin आणि Manager नुसार search करा
            </p>
          </div>

        </section>

        {/* ================= SEARCH FILTERS ================= */}

        <section className="customer-search-filters">

          {/* SEARCH BY DATE */}

          <div className="customer-filter-field">
            <label>SEARCH BY DATE</label>

            <input
              type="date"
              value={searchDate}
              onChange={(event) =>
                setSearchDate(event.target.value)
              }
            />
          </div>

          {/* SEARCH BY SUB ADMIN */}

          <div className="customer-filter-field">
            <label>SEARCH BY SUB ADMIN</label>

            <input
              type="text"
              placeholder="Sub Admin name or ID..."
              value={searchSubAdmin}
              onChange={(event) =>
                setSearchSubAdmin(event.target.value)
              }
            />
          </div>

          {/* SEARCH BY MANAGER */}

          <div className="customer-filter-field">
            <label>SEARCH BY MANAGER</label>

            <input
              type="text"
              placeholder="Manager name or ID..."
              value={searchManager}
              onChange={(event) =>
                setSearchManager(event.target.value)
              }
            />
          </div>

          {/* STATUS */}

          <div className="customer-filter-field">
            <label>STATUS</label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Status
              </option>

              <option value="VERIFIED">
                Verified
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="REJECTED">
                Rejected
              </option>
            </select>
          </div>

        </section>

        {/* ================= TABLE ================= */}

        <section className="all-customer-table-card">

          {filteredRecords.length === 0 ? (

            <div className="all-customer-empty">

              <div>🪪</div>

              <h3>Customer ID Record नाही</h3>

              <p>
                Search/filter प्रमाणे Customer ID record सापडला नाही.
              </p>

            </div>

          ) : (

            <div className="all-customer-table-wrapper">

              <table className="all-customer-table">

                <thead>
                  <tr>
                    <th>SR.</th>
                    <th>DATE</th>
                    <th>MANAGER</th>
                    <th>SUB ADMIN</th>
                    <th>PROPERTY</th>
                    <th>FRONT PHOTO</th>
                    <th>BACK PHOTO</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map(
                    (record, index) => {

                      const manager =
                        getManager(record.managerId);

                      const subAdmin =
                        getSubAdmin(manager);

                      return (
                        <tr key={record.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {record.date}
                            </strong>
                          </td>

                          {/* MANAGER */}

                          <td>

                            <div className="customer-manager-info">

                              <div className="customer-manager-avatar">

                                {(manager?.managerName || "M")
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <strong>
                                  {manager?.managerName ||
                                    "Manager"}
                                </strong>

                                <small>
                                  {record.managerId || "-"}
                                </small>

                              </div>

                            </div>

                          </td>

                          {/* SUB ADMIN */}

                          <td>
                            {subAdmin?.name || "-"}
                          </td>

                          {/* PROPERTY */}

                          <td>
                            <strong>
                              {subAdmin?.propertyName || "-"}
                            </strong>
                          </td>

                          {/* FRONT */}

                          <td>

                            <button
                              className="customer-front-view"
                              onClick={() =>
                                handleViewPhoto("Front")
                              }
                            >
                              📷 FRONT
                            </button>

                          </td>

                          {/* BACK */}

                          <td>

                            <button
                              className="customer-back-view"
                              onClick={() =>
                                handleViewPhoto("Back")
                              }
                            >
                              📷 BACK
                            </button>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                record.status === "VERIFIED"
                                  ? "customer-main-status verified"
                                  : "customer-main-status pending"
                              }
                            >
                              {record.status || "PENDING"}
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

export default AllCustomerPhotos;