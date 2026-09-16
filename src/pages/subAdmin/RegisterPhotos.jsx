import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/tables.css";

function RegisterPhotos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Logged-in Sub Admin
  const currentSubAdminId = user?.subAdminId;

  const [search, setSearch] = useState("");

  // =====================================
  // LOAD MANAGERS
  // =====================================

  const managers = useMemo(() => {
    return (
      JSON.parse(
        localStorage.getItem("managers")
      ) || []
    );
  }, []);

  // =====================================
  // LOAD REGISTER RECORDS
  // =====================================

  const registerRecords = useMemo(() => {
    return (
      JSON.parse(
        localStorage.getItem(
          "registerPhotoRecords"
        )
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
  // MANAGER IDS
  // =====================================

  const myManagerIds = useMemo(() => {
    return myManagers.map(
      (manager) => manager.managerId
    );
  }, [myManagers]);

  // =====================================
  // ONLY THIS SUB ADMIN'S
  // REGISTER RECORDS
  // =====================================

  const myRecords = useMemo(() => {
    if (!currentSubAdminId) {
      return [];
    }

    return registerRecords.filter(
      (record) => {
        // New records:
        // managerId + subAdminId available
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
        // having managerId but no subAdminId
        if (record.managerId) {
          return myManagerIds.includes(
            record.managerId
          );
        }

        // Very old records without managerId
        // are not shown.
        return false;
      }
    );
  }, [
    registerRecords,
    currentSubAdminId,
    myManagerIds,
  ]);

  // =====================================
  // SEARCH
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

      return matchesSearch;
    });
  }, [
    search,
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

  const handleViewPhoto = (record) => {
    // Extra frontend ownership check
    if (
      record.subAdminId &&
      record.subAdminId !==
        currentSubAdminId
    ) {
      window.alert(
        "या Register Photo वर तुम्हाला access नाही."
      );
      return;
    }

    if (
      !myManagerIds.includes(
        record.managerId
      )
    ) {
      window.alert(
        "हा Manager तुमच्या account अंतर्गत नाही."
      );
      return;
    }

    window.alert(
      "Actual Register Photo Spring Boot + Cloudflare R2 जोडल्यानंतर येथे उघडेल."
    );
  };

  return (
    <div className="register-admin-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="register-admin-header">

        <div>

          <span>
            SUB ADMIN / REGISTER RECORDS
          </span>

          <h1>
            Register Photos
          </h1>

          <p>
            तुमच्या Managers ने Upload केलेले
            Register Photos
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

      <main className="register-admin-container">

        {/* =========================
            LOGGED-IN SUB ADMIN
        ========================= */}

        <section className="register-sub-admin-info">

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

        <section className="register-summary">

          <div className="register-summary-card">

            <small>
              TOTAL REGISTER PHOTOS
            </small>

            <strong>
              {myRecords.length}
            </strong>

          </div>

          <div className="register-summary-card manager-count">

            <small>
              MY MANAGERS
            </small>

            <strong>
              {myManagers.length}
            </strong>

          </div>

        </section>

        {/* =========================
            TITLE + SEARCH
        ========================= */}

        <section className="register-admin-toolbar">

          <div>

            <h2>
              Register Records
            </h2>

            <p>
              Manager Name, Manager ID किंवा
              Date ने search करा.
            </p>

          </div>

          <input
            type="text"
            placeholder="Search register photo..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </section>

        {/* =========================
            TABLE
        ========================= */}

        <section className="register-admin-table-card">

          {filteredRecords.length === 0 ? (

            <div className="register-admin-empty">

              <div>
                📷
              </div>

              <h3>
                Register Photo नाही
              </h3>

              <p>
                तुमच्या Manager ने Register Photo
                Upload केल्यानंतर येथे record
                दिसेल.
              </p>

            </div>

          ) : (

            <div className="register-admin-table-wrapper">

              <table className="register-admin-table">

                <thead>

                  <tr>
                    <th>SR.</th>
                    <th>DATE</th>
                    <th>MANAGER</th>
                    <th>MANAGER ID</th>
                    <th>REGISTER PHOTO</th>
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

                          <div className="register-manager-cell">

                            <div className="register-manager-avatar">

                              {getManagerName(
                                record.managerId
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <strong>

                              {getManagerName(
                                record.managerId
                              )}

                            </strong>

                          </div>

                        </td>

                        <td>

                          <span className="register-manager-id">
                            {record.managerId}
                          </span>

                        </td>

                        <td>

                          <button
                            type="button"
                            className="register-view-button"
                            onClick={() =>
                              handleViewPhoto(
                                record
                              )
                            }
                          >
                            📷 VIEW PHOTO
                          </button>

                        </td>

                        <td>

                          <span className="register-upload-status">
                            {record.status ||
                              "UPLOADED"}
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

export default RegisterPhotos;