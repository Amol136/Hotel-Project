import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function CustomerPhotos() {
  const navigate = useNavigate();

  const currentSubAdminId = "SUBADMIN-001";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const managers =
    JSON.parse(localStorage.getItem("managers")) || [];

  const customerRecords =
    JSON.parse(localStorage.getItem("customerRecords")) || [];

  // फक्त current Sub Admin चे managers
  const myManagers = managers.filter(
    (manager) =>
      manager.createdBySubAdminId === currentSubAdminId
  );

  const myManagerIds = myManagers.map(
    (manager) => manager.managerId
  );

  // Backend येईपर्यंत जुन्या records साठी
  // पहिला manager fallback म्हणून वापरतो.
  const recordsWithManager = customerRecords.map(
    (record) => ({
      ...record,
      managerId:
        record.managerId ||
        myManagers[0]?.managerId ||
        "MGR-001",
    })
  );

  const filteredRecords = useMemo(() => {
    return recordsWithManager.filter((record) => {
      const manager = myManagers.find(
        (item) => item.managerId === record.managerId
      );

      const belongsToSubAdmin =
        myManagerIds.includes(record.managerId);

      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        manager?.managerName
          ?.toLowerCase()
          .includes(searchText) ||
        record.managerId
          ?.toLowerCase()
          .includes(searchText) ||
        record.date
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        record.status === statusFilter;

      return (
        belongsToSubAdmin &&
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    search,
    statusFilter,
    recordsWithManager,
    myManagers,
    myManagerIds,
  ]);

  const getManagerName = (managerId) => {
    const manager = myManagers.find(
      (item) => item.managerId === managerId
    );

    return manager?.managerName || "Manager";
  };

  const handleViewPhoto = (side) => {
    alert(
      `${side} photo Cloudflare R2 backend जोडल्यानंतर येथे उघडेल.`
    );
  };

  return (
    <div className="sub-photo-page">

      <header className="sub-photo-header">

        <div>
          <span>SUB ADMIN / CUSTOMER RECORDS</span>

          <h1>Customer ID Photos</h1>

          <p>
            तुमच्या Managers ने Upload केलेले
            Customer ID records
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/sub-admin/dashboard")
          }
        >
          ← DASHBOARD
        </button>

      </header>

      <main className="sub-photo-container">

        {/* SUMMARY */}

        <section className="photo-summary-grid">

          <div className="photo-summary-card">
            <small>TOTAL RECORDS</small>
            <strong>
              {filteredRecords.length}
            </strong>
          </div>

          <div className="photo-summary-card verified">
            <small>VERIFIED</small>

            <strong>
              {
                filteredRecords.filter(
                  (record) =>
                    record.status === "VERIFIED"
                ).length
              }
            </strong>
          </div>

          <div className="photo-summary-card pending">
            <small>PENDING</small>

            <strong>
              {
                filteredRecords.filter(
                  (record) =>
                    record.status === "PENDING"
                ).length
              }
            </strong>
          </div>

        </section>

        {/* FILTER */}

        <section className="photo-filter-bar">

          <div>
            <h2>Customer Records</h2>
            <p>
              Manager, ID किंवा Date ने search करा
            </p>
          </div>

          <div className="photo-filter-controls">

            <input
              type="text"
              placeholder="Search..."
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

              <option value="VERIFIED">
                Verified
              </option>

              <option value="PENDING">
                Pending
              </option>
            </select>

          </div>

        </section>

        {/* TABLE */}

        <section className="sub-photo-table-card">

          {filteredRecords.length === 0 ? (

            <div className="sub-photo-empty">
              <div>🪪</div>

              <h3>
                Customer ID record नाही
              </h3>

              <p>
                Manager ने Customer ID Upload
                केल्यानंतर येथे record दिसेल.
              </p>
            </div>

          ) : (

            <div className="sub-photo-table-wrapper">

              <table className="sub-photo-table">

                <thead>
                  <tr>
                    <th>SR.</th>
                    <th>DATE</th>
                    <th>MANAGER</th>
                    <th>MANAGER ID</th>
                    <th>FRONT PHOTO</th>
                    <th>BACK PHOTO</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map(
                    (record, index) => (

                      <tr key={record.id}>

                        <td>{index + 1}</td>

                        <td>
                          <strong>
                            {record.date}
                          </strong>
                        </td>

                        <td>
                          {getManagerName(
                            record.managerId
                          )}
                        </td>

                        <td>
                          <span className="sub-manager-id">
                            {record.managerId}
                          </span>
                        </td>

                        <td>
                          <button
                            className="front-photo-button"
                            onClick={() =>
                              handleViewPhoto(
                                "Front"
                              )
                            }
                          >
                            FRONT PHOTO
                          </button>
                        </td>

                        <td>
                          <button
                            className="back-photo-button"
                            onClick={() =>
                              handleViewPhoto(
                                "Back"
                              )
                            }
                          >
                            BACK PHOTO
                          </button>
                        </td>

                        <td>
                          <span
                            className={
                              record.status ===
                              "VERIFIED"
                                ? "sub-record-status verified"
                                : "sub-record-status pending"
                            }
                          >
                            {record.status}
                          </span>
                        </td>

                      </tr>

                    )
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

export default CustomerPhotos;