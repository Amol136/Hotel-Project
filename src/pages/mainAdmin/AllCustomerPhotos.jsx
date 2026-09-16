import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function AllCustomerPhotos() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [records] = useState(() => {
    return JSON.parse(localStorage.getItem("customerRecords")) || [];
  });

  const [managers] = useState(() => {
    return JSON.parse(localStorage.getItem("managers")) || [];
  });

  const [subAdmins] = useState(() => {
    return JSON.parse(localStorage.getItem("subAdmins")) || [];
  });

  const getManager = (managerId) => {
    return managers.find(
      (manager) =>
        manager.managerId?.toLowerCase() ===
        managerId?.toLowerCase()
    );
  };

  const getSubAdmin = (manager) => {
    if (!manager) return null;

    return subAdmins.find(
      (subAdmin) =>
        subAdmin.subAdminId?.toLowerCase() ===
        manager.createdBySubAdminId?.toLowerCase()
    );
  };

  const text = search.toLowerCase().trim();

  const filteredRecords = records.filter((record) => {
    const manager = getManager(record.managerId);
    const subAdmin = getSubAdmin(manager);

    const matchesSearch =
      !text ||
      record.date?.toLowerCase().includes(text) ||
      record.managerId?.toLowerCase().includes(text) ||
      manager?.managerName?.toLowerCase().includes(text) ||
      subAdmin?.name?.toLowerCase().includes(text) ||
      subAdmin?.propertyName?.toLowerCase().includes(text);

    const matchesStatus =
      statusFilter === "ALL" ||
      record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewPhoto = (side) => {
    alert(
      `${side} Customer ID Photo Spring Boot + Cloudflare R2 जोडल्यानंतर येथे उघडेल.`
    );
  };

  return (
    <div className="all-customer-page">

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
                  (record) => record.status === "VERIFIED"
                ).length
              }
            </strong>
          </div>

          <div className="customer-pending-card">
            <small>PENDING</small>

            <strong>
              {
                records.filter(
                  (record) => record.status === "PENDING"
                ).length
              }
            </strong>
          </div>

          <div className="customer-manager-card">
            <small>MANAGERS</small>
            <strong>{managers.length}</strong>
          </div>

        </section>

        <section className="all-customer-toolbar">

          <div>
            <h2>Customer ID Records</h2>

            <p>
              Date, Manager, Sub Admin किंवा Property ने search करा
            </p>
          </div>

          <div className="all-customer-filters">

            <input
              type="text"
              placeholder="Search customer record..."
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
              <option value="ALL">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
            </select>

          </div>

        </section>

        <section className="all-customer-table-card">

          {filteredRecords.length === 0 ? (

            <div className="all-customer-empty">
              <div>🪪</div>

              <h3>Customer ID Record नाही</h3>

              <p>
                Manager ने Customer ID Upload केल्यानंतर येथे दिसेल.
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

                  {filteredRecords.map((record, index) => {
                    const manager =
                      getManager(record.managerId);

                    const subAdmin =
                      getSubAdmin(manager);

                    return (
                      <tr key={record.id}>

                        <td>{index + 1}</td>

                        <td>
                          <strong>{record.date}</strong>
                        </td>

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

                        <td>
                          {subAdmin?.name || "-"}
                        </td>

                        <td>
                          <strong>
                            {subAdmin?.propertyName || "-"}
                          </strong>
                        </td>

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
                  })}

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