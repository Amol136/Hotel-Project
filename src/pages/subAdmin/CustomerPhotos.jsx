import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/tables.css";

function CustomerPhotos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Logged-in Sub Admin
  const currentSubAdminId = user?.subAdminId;

  const [search, setSearch] = useState("");
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
        // New records have direct subAdminId
        if (record.subAdminId) {
          return (
            record.subAdminId ===
              currentSubAdminId &&
            myManagerIds.includes(
              record.managerId
            )
          );
        }

        // Temporary support for older records
        // that have managerId but no subAdminId
        if (record.managerId) {
          return myManagerIds.includes(
            record.managerId
          );
        }

        // Very old dummy records without
        // managerId/subAdminId are not shown.
        return false;
      }
    );
  }, [
    customerRecords,
    currentSubAdminId,
    myManagerIds,
  ]);

  // =====================================
  // SEARCH + STATUS FILTER
  // =====================================

  const filteredRecords = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return myRecords.filter((record) => {
      const manager = myManagers.find(
        (item) =>
          item.managerId === record.managerId
      );

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
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    search,
    statusFilter,
    myRecords,
    myManagers,
  ]);

  // =====================================
  // MANAGER NAME
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

          <div className="photo-summary-card">

            <small>
              TOTAL RECORDS
            </small>

            <strong>
              {myRecords.length}
            </strong>

          </div>

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

          <div>

            <h2>
              Customer Records
            </h2>

            <p>
              Manager, ID किंवा Date ने
              search करा
            </p>

          </div>

          <div className="photo-filter-controls">

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

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

                        <td>
                          {index + 1}
                        </td>

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