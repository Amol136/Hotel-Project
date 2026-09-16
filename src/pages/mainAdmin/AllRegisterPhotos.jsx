import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function AllRegisterPhotos() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [records] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("registerPhotoRecords")) || []
    );
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

    return (
      !text ||
      record.date?.toLowerCase().includes(text) ||
      record.managerId?.toLowerCase().includes(text) ||
      manager?.managerName?.toLowerCase().includes(text) ||
      subAdmin?.name?.toLowerCase().includes(text) ||
      subAdmin?.propertyName?.toLowerCase().includes(text)
    );
  });

  const handleViewPhoto = () => {
    alert(
      "Actual Register Photo Spring Boot + Cloudflare R2 जोडल्यानंतर येथे उघडेल."
    );
  };

  return (
    <div className="main-register-page">

      <header className="main-register-header">

        <div>
          <span>MAIN ADMIN / REGISTER RECORDS</span>

          <h1>All Register Photos</h1>

          <p>
            सर्व Managers ने Upload केलेले Register Photos
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

      <main className="main-register-container">

        <section className="main-register-summary">

          <div>
            <small>TOTAL REGISTER PHOTOS</small>
            <strong>{records.length}</strong>
          </div>

          <div className="main-register-manager-count">
            <small>TOTAL MANAGERS</small>
            <strong>{managers.length}</strong>
          </div>

          <div className="main-register-subadmin-count">
            <small>SUB ADMINS</small>
            <strong>{subAdmins.length}</strong>
          </div>

        </section>

        <section className="main-register-toolbar">

          <div>
            <h2>Register Records</h2>

            <p>
              Date, Manager, Sub Admin किंवा Property ने search करा
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

        <section className="main-register-table-card">

          {filteredRecords.length === 0 ? (

            <div className="main-register-empty">

              <div>📷</div>

              <h3>Register Photo नाही</h3>

              <p>
                Manager ने Register Photo Upload केल्यानंतर
                येथे record दिसेल.
              </p>

            </div>

          ) : (

            <div className="main-register-table-wrapper">

              <table className="main-register-table">

                <thead>
                  <tr>
                    <th>SR.</th>
                    <th>DATE</th>
                    <th>MANAGER</th>
                    <th>MANAGER ID</th>
                    <th>SUB ADMIN</th>
                    <th>PROPERTY</th>
                    <th>REGISTER PHOTO</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map((record, index) => {
                    const manager = getManager(
                      record.managerId
                    );

                    const subAdmin = getSubAdmin(manager);

                    return (
                      <tr key={record.id}>

                        <td>{index + 1}</td>

                        <td>
                          <strong>{record.date}</strong>
                        </td>

                        <td>

                          <div className="main-register-manager">

                            <div className="main-register-avatar">
                              {(manager?.managerName || "M")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {manager?.managerName ||
                                "Manager"}
                            </strong>

                          </div>

                        </td>

                        <td>
                          <span className="main-register-manager-id">
                            {record.managerId || "-"}
                          </span>
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
                            className="main-register-view"
                            onClick={handleViewPhoto}
                          >
                            📷 VIEW PHOTO
                          </button>
                        </td>

                        <td>
                          <span className="main-register-status">
                            {record.status || "UPLOADED"}
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

export default AllRegisterPhotos;