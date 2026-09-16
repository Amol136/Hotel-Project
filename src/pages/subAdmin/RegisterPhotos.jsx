import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function RegisterPhotos() {
  const navigate = useNavigate();

  // Temporary - backend/JWT नंतर काढणार
  const currentSubAdminId = "SUBADMIN-001";

  const [search, setSearch] = useState("");

  const managers =
    JSON.parse(localStorage.getItem("managers")) || [];

  const registerRecords =
    JSON.parse(
      localStorage.getItem("registerPhotoRecords")
    ) || [];

  // फक्त या Sub Admin चे Managers
  const myManagers = managers.filter(
    (manager) =>
      manager.createdBySubAdminId === currentSubAdminId
  );

  const myManagerIds = myManagers.map(
    (manager) => manager.managerId
  );

  // जुने frontend records managerId शिवाय असतील
  // म्हणून temporary fallback
  const recordsWithManager = registerRecords.map(
    (record) => ({
      ...record,
      managerId:
        record.managerId ||
        myManagers[0]?.managerId ||
        "MGR-001",
    })
  );

  const filteredRecords = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    return recordsWithManager.filter((record) => {
      const manager = myManagers.find(
        (item) =>
          item.managerId === record.managerId
      );

      const belongsToSubAdmin =
        myManagerIds.includes(record.managerId);

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

      return belongsToSubAdmin && matchesSearch;
    });
  }, [
    search,
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

  const handleViewPhoto = () => {
    alert(
      "Actual Register Photo Spring Boot + Cloudflare R2 जोडल्यानंतर येथे उघडेल."
    );
  };

  return (
    <div className="register-admin-page">

      {/* HEADER */}

      <header className="register-admin-header">

        <div>
          <span>
            SUB ADMIN / REGISTER RECORDS
          </span>

          <h1>Register Photos</h1>

          <p>
            तुमच्या Managers ने Upload केलेले
            Register Photos
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

      <main className="register-admin-container">

        {/* SUMMARY */}

        <section className="register-summary">

          <div className="register-summary-card">

            <small>
              TOTAL REGISTER PHOTOS
            </small>

            <strong>
              {filteredRecords.length}
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

        {/* TITLE + SEARCH */}

        <section className="register-admin-toolbar">

          <div>
            <h2>Register Records</h2>

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
              setSearch(event.target.value)
            }
          />

        </section>

        {/* TABLE */}

        <section className="register-admin-table-card">

          {filteredRecords.length === 0 ? (

            <div className="register-admin-empty">

              <div>📷</div>

              <h3>
                Register Photo नाही
              </h3>

              <p>
                Manager ने Register Photo Upload
                केल्यानंतर येथे record दिसेल.
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
                            className="register-view-button"
                            onClick={
                              handleViewPhoto
                            }
                          >
                            📷 VIEW PHOTO
                          </button>

                        </td>

                        <td>

                          <span className="register-upload-status">
                            UPLOADED
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