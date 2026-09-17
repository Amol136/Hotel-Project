import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/tables.css";

function CustomerPhotos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================
  // LOGGED-IN SUB ADMIN
  // =====================================

  const currentSubAdminId = user?.subAdminId;

  // =====================================
  // SEARCH FILTERS
  // =====================================

  const [searchDate, setSearchDate] =
    useState("");

  const [searchManager, setSearchManager] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // =====================================
  // GET MANAGERS
  // =====================================

  const managers = useMemo(() => {
    return (
      JSON.parse(
        localStorage.getItem("managers")
      ) || []
    );
  }, []);

  // =====================================
  // GET CUSTOMER RECORDS
  // =====================================

  const customerRecords = useMemo(() => {
    return (
      JSON.parse(
        localStorage.getItem("customerRecords")
      ) || []
    );
  }, []);

  // =====================================
  // ONLY THIS SUB ADMIN'S MANAGERS
  // =====================================

  const myManagers = useMemo(() => {
    if (!currentSubAdminId) {
      return [];
    }

    return managers.filter(
      (manager) =>
        manager.createdBySubAdminId ===
        currentSubAdminId
    );
  }, [managers, currentSubAdminId]);

  // =====================================
  // MANAGER IDs
  // =====================================

  const myManagerIds = useMemo(() => {
    return myManagers.map(
      (manager) => manager.managerId
    );
  }, [myManagers]);

  // =====================================
  // ONLY THIS SUB ADMIN'S RECORDS
  // =====================================

  const myRecords = useMemo(() => {
    if (!currentSubAdminId) {
      return [];
    }

    return customerRecords.filter(
      (record) => {

        // New records
        if (record.subAdminId) {
          return (
            record.subAdminId ===
              currentSubAdminId &&
            myManagerIds.includes(
              record.managerId
            )
          );
        }

        // Old records support
        if (record.managerId) {
          return myManagerIds.includes(
            record.managerId
          );
        }

        return false;
      }
    );
  }, [
    customerRecords,
    currentSubAdminId,
    myManagerIds,
  ]);

  // =====================================
  // DATE + MANAGER + STATUS FILTER
  // =====================================

  const filteredRecords = useMemo(() => {
    const dateText =
      searchDate.toLowerCase().trim();

    const managerText =
      searchManager.toLowerCase().trim();

    return myRecords.filter((record) => {

      const manager = myManagers.find(
        (item) =>
          item.managerId ===
          record.managerId
      );

      // SEARCH BY DATE
      const matchesDate =
        !dateText ||
        record.date
          ?.toLowerCase()
          .includes(dateText);

      // SEARCH BY MANAGER
      // Manager Name किंवा Manager ID
      const matchesManager =
        !managerText ||
        manager?.managerName
          ?.toLowerCase()
          .includes(managerText) ||
        record.managerId
          ?.toLowerCase()
          .includes(managerText);

      // STATUS
      const matchesStatus =
        statusFilter === "ALL" ||
        record.status === statusFilter;

      return (
        matchesDate &&
        matchesManager &&
        matchesStatus
      );
    });
  }, [
    searchDate,
    searchManager,
    statusFilter,
    myRecords,
    myManagers,
  ]);

  // =====================================
  // GET MANAGER NAME
  // =====================================

  const getManagerName = (managerId) => {
    const manager = myManagers.find(
      (item) =>
        item.managerId === managerId
    );

    return (
      manager?.managerName ||
      "Manager"
    );
  };

  // =====================================
  // VIEW PHOTO
  // =====================================

  const handleViewPhoto = (
    side,
    record
  ) => {

    if (
      record.subAdminId &&
      record.subAdminId !==
        currentSubAdminId
    ) {
      window.alert(
        "या record वर तुम्हाला access नाही."
      );

      return;
    }

    window.alert(
      `${side} photo Cloudflare R2 backend जोडल्यानंतर येथे उघडेल.`
    );
  };

  return (
    <div className="sub-photo-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="sub-photo-header">

        <div>

          <span>
            SUB ADMIN / CUSTOMER RECORDS
          </span>

          <h1>
            Customer ID Photos
          </h1>

          <p>
            तुमच्या Managers ने Upload केलेले
            Customer ID records
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/sub-admin/dashboard"
            )
          }
        >
          ← DASHBOARD
        </button>

      </header>

      <main className="sub-photo-container">

        {/* =========================
            LOGGED-IN SUB ADMIN
        ========================= */}

        <section className="sub-photo-admin-info">

          <div>

            <small>
              LOGGED IN SUB ADMIN
            </small>

            <strong>
              {user?.name || "Sub Admin"}
            </strong>

          </div>

          <span>
            {currentSubAdminId || "-"}
          </span>

        </section>

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="photo-summary-grid">

          {/* TOTAL */}

          <div className="photo-summary-card">

            <small>
              TOTAL RECORDS
            </small>

            <strong>
              {myRecords.length}
            </strong>

          </div>

          {/* VERIFIED */}

          <div className="photo-summary-card verified">

            <small>
              VERIFIED
            </small>

            <strong>
              {
                myRecords.filter(
                  (record) =>
                    record.status ===
                    "VERIFIED"
                ).length
              }
            </strong>

          </div>

          {/* PENDING */}

          <div className="photo-summary-card pending">

            <small>
              PENDING
            </small>

            <strong>
              {
                myRecords.filter(
                  (record) =>
                    record.status ===
                    "PENDING"
                ).length
              }
            </strong>

          </div>

        </section>

        {/* =========================
            FILTER
        ========================= */}

        <section className="photo-filter-bar">

          <div className="photo-filter-heading">

            <h2>
              Customer Records
            </h2>

            <p>
              Date आणि Manager नुसार
              search करा
            </p>

          </div>

          <div className="sub-customer-search-area">

            {/* SEARCH BY DATE */}

            <div className="sub-customer-filter">

              <label>
                SEARCH BY DATE
              </label>

              <input
                type="date"
                value={searchDate}
                onChange={(event) =>
                  setSearchDate(
                    event.target.value
                  )
                }
              />

            </div>

            {/* SEARCH BY MANAGER */}

            <div className="sub-customer-filter">

              <label>
                SEARCH BY MANAGER
              </label>

              <input
                type="text"
                placeholder="Manager name or ID..."
                value={searchManager}
                onChange={(event) =>
                  setSearchManager(
                    event.target.value
                  )
                }
              />

            </div>

            {/* STATUS */}

            <div className="sub-customer-filter">

              <label>
                STATUS
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
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

          </div>

        </section>

        {/* =========================
            TABLE
        ========================= */}

        <section className="sub-photo-table-card">

          {filteredRecords.length === 0 ? (

            <div className="sub-photo-empty">

              <div>
                🪪
              </div>

              <h3>
                Customer ID record नाही
              </h3>

              <p>
                तुमच्या Manager ने Customer ID
                Upload केल्यानंतर येथे record
                दिसेल.
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

                        {/* SR */}

                        <td>
                          {index + 1}
                        </td>

                        {/* DATE */}

                        <td>

                          <strong>
                            {record.date}
                          </strong>

                        </td>

                        {/* MANAGER */}

                        <td>

                          {getManagerName(
                            record.managerId
                          )}

                        </td>

                        {/* MANAGER ID */}

                        <td>

                          <span className="sub-manager-id">

                            {record.managerId}

                          </span>

                        </td>

                        {/* FRONT PHOTO */}

                        <td>

                          <button
                            type="button"
                            className="front-photo-button"
                            onClick={() =>
                              handleViewPhoto(
                                "Front",
                                record
                              )
                            }
                          >
                            FRONT PHOTO
                          </button>

                        </td>

                        {/* BACK PHOTO */}

                        <td>

                          <button
                            type="button"
                            className="back-photo-button"
                            onClick={() =>
                              handleViewPhoto(
                                "Back",
                                record
                              )
                            }
                          >
                            BACK PHOTO
                          </button>

                        </td>

                        {/* STATUS */}

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