import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/tables.css";

function AllRegisterPhotos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================
  // LOGGED-IN MAIN ADMIN
  // =====================================

  const mainAdminId = user?.id;

  // =====================================
  // DATA
  // =====================================

  const [records, setRecords] = useState([]);
  const [managers, setManagers] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================
  // SEARCH
  // =====================================

  const [search, setSearch] = useState("");

  // =====================================
  // PHOTO VIEWER
  // =====================================

  const [viewerOpen, setViewerOpen] =
    useState(false);

  const [viewerUrl, setViewerUrl] =
    useState("");

  const [
    viewerDownloadUrl,
    setViewerDownloadUrl,
  ] = useState("");

  const [viewerLoading, setViewerLoading] =
    useState(false);

  // =====================================
  // LOAD DATA
  // =====================================

  useEffect(() => {
    if (
      !mainAdminId ||
      user?.role !== "MAIN_ADMIN"
    ) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          recordsResponse,
          managersResponse,
          subAdminsResponse,
        ] = await Promise.all([
          apiFetch(
            `/api/register-photos/main-admin/${mainAdminId}`
          ),

          apiFetch(
            "/api/users/managers"
          ),

          apiFetch(
            "/api/users/sub-admins"
          ),
        ]);

        // REGISTER RECORDS

        if (!recordsResponse.ok) {
          const message =
            await recordsResponse.text();

          throw new Error(
            message ||
              "Register Photo records load झाले नाहीत."
          );
        }

        // MANAGERS

        if (!managersResponse.ok) {
          const message =
            await managersResponse.text();

          throw new Error(
            message ||
              "Managers load झाले नाहीत."
          );
        }

        // SUB ADMINS

        if (!subAdminsResponse.ok) {
          const message =
            await subAdminsResponse.text();

          throw new Error(
            message ||
              "Sub Admins load झाले नाहीत."
          );
        }

        const recordsData =
          await recordsResponse.json();

        const managersData =
          await managersResponse.json();

        const subAdminsData =
          await subAdminsResponse.json();

        if (cancelled) {
          return;
        }

        setRecords(
          Array.isArray(recordsData)
            ? recordsData
            : []
        );

        setManagers(
          Array.isArray(managersData)
            ? managersData
            : []
        );

        setSubAdmins(
          Array.isArray(subAdminsData)
            ? subAdminsData
            : []
        );

        setError("");
      } catch (err) {
        console.error(
          "All Register Photos Load Error:",
          err
        );

        if (!cancelled) {
          if (
            err.message ===
            "Failed to fetch"
          ) {
            setError(
              "Backend server connect होत नाही."
            );
          } else {
            setError(
              err.message ||
                "Data load करताना error आला."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    mainAdminId,
    user?.role,
  ]);

  // =====================================
  // GET MANAGER
  // =====================================

  const getManager = (
    managerDatabaseId
  ) => {
    return managers.find(
      (manager) =>
        Number(manager.id) ===
        Number(managerDatabaseId)
    );
  };

  // =====================================
  // GET SUB ADMIN
  // =====================================

  const getSubAdmin = (
    subAdminDatabaseId
  ) => {
    return subAdmins.find(
      (subAdmin) =>
        Number(subAdmin.id) ===
        Number(subAdminDatabaseId)
    );
  };

  // =====================================
  // FILTER
  // STATUS SEARCH REMOVED
  // =====================================

  const filteredRecords =
    useMemo(() => {
      const text =
        search
          .toLowerCase()
          .trim();

      return records.filter(
        (record) => {
          const manager =
            managers.find(
              (item) =>
                Number(item.id) ===
                Number(
                  record.managerId
                )
            );

          const subAdmin =
            subAdmins.find(
              (item) =>
                Number(item.id) ===
                Number(
                  record.subAdminId
                )
            );

          if (!text) {
            return true;
          }

          // MANAGER

          const managerName =
            String(
              manager?.name ||
                manager?.managerName ||
                ""
            ).toLowerCase();

          const managerUserId =
            String(
              manager?.userId ||
                manager?.managerId ||
                ""
            ).toLowerCase();

          // SUB ADMIN

          const subAdminName =
            String(
              subAdmin?.name ||
                subAdmin?.subAdminName ||
                ""
            ).toLowerCase();

          const subAdminUserId =
            String(
              subAdmin?.subAdminId ||
                subAdmin?.userId ||
                ""
            ).toLowerCase();

          // DATE

          const recordDate =
            String(
              record.date || ""
            ).toLowerCase();

          // STATUS SEARCH REMOVED

          return (
            recordDate.includes(text) ||
            managerName.includes(text) ||
            managerUserId.includes(text) ||
            subAdminName.includes(text) ||
            subAdminUserId.includes(text)
          );
        }
      );
    }, [
      records,
      managers,
      subAdmins,
      search,
    ]);

  // =====================================
  // OPEN PHOTO VIEWER
  // VIEW + DOWNLOAD URL
  // =====================================

  const handleViewPhoto =
    async (recordId) => {
      try {
        if (!mainAdminId) {
          throw new Error(
            "Main Admin login माहिती मिळाली नाही."
          );
        }

        setViewerLoading(true);
        setError("");

        /*
         * VIEW आणि DOWNLOAD URL
         * एकाच वेळी backend कडून घेतो.
         */

        const [
          viewResponse,
          downloadResponse,
        ] = await Promise.all([
          apiFetch(
            `/api/register-photos/${recordId}/main-admin-photo-url?mainAdminId=${mainAdminId}`
          ),

          apiFetch(
            `/api/register-photos/${recordId}/main-admin-download-url?mainAdminId=${mainAdminId}`
          ),
        ]);

        // VIEW URL CHECK

        if (!viewResponse.ok) {
          const message =
            await viewResponse.text();

          throw new Error(
            message ||
              "Register Photo open झाली नाही."
          );
        }

        // DOWNLOAD URL CHECK

        if (!downloadResponse.ok) {
          const message =
            await downloadResponse.text();

          throw new Error(
            message ||
              "Download URL मिळाली नाही."
          );
        }

        const viewData =
          await viewResponse.json();

        const downloadData =
          await downloadResponse.json();

        if (!viewData?.url) {
          throw new Error(
            "Photo URL मिळाली नाही."
          );
        }

        setViewerUrl(
          viewData.url
        );

        setViewerDownloadUrl(
          downloadData?.url || ""
        );

        setViewerOpen(true);
      } catch (err) {
        console.error(
          "View Register Photo Error:",
          err
        );

        window.alert(
          err.message ||
            "Register Photo open करताना error आला."
        );
      } finally {
        setViewerLoading(false);
      }
    };

  // =====================================
  // CLOSE VIEWER
  // =====================================

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl("");
    setViewerDownloadUrl("");
  };

  // =====================================
  // DOWNLOAD FROM VIEWER
  // =====================================

  const handleViewerDownload = () => {
    if (!viewerDownloadUrl) {
      window.alert(
        "Download URL मिळाली नाही."
      );

      return;
    }

    window.location.href =
      viewerDownloadUrl;
  };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="main-register-page">

        <div className="main-register-empty">
          <h3>
            Loading Register Photos...
          </h3>
        </div>

      </div>
    );
  }

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="main-register-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="main-register-header">

        <div>
          <span>
            MAIN ADMIN / REGISTER RECORDS
          </span>

          <h1>
            All Register Photos
          </h1>

          <p>
            सर्व Managers ने Upload केलेले
            Register Photos
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/main-admin/dashboard"
            )
          }
        >
          ← DASHBOARD
        </button>

      </header>

      <main className="main-register-container">

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              borderRadius: "8px",
              background: "#ffe5e5",
              color: "#a40000",
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="main-register-summary">

          <div>
            <small>
              TOTAL REGISTER PHOTOS
            </small>

            <strong>
              {records.length}
            </strong>
          </div>

          <div className="main-register-manager-count">
            <small>
              TOTAL MANAGERS
            </small>

            <strong>
              {managers.length}
            </strong>
          </div>

          <div className="main-register-subadmin-count">
            <small>
              SUB ADMINS
            </small>

            <strong>
              {subAdmins.length}
            </strong>
          </div>

        </section>

        {/* =========================
            TOOLBAR
        ========================= */}

        <section className="main-register-toolbar">

          <div>
            <h2>
              Register Records
            </h2>

            <p>
              Date, Manager किंवा Sub Admin
              नुसार search करा
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

        <section className="main-register-table-card">

          {filteredRecords.length === 0 ? (

            <div className="main-register-empty">

              <div>
                📷
              </div>

              <h3>
                Register Photo नाही
              </h3>

              <p>
                Search प्रमाणे Register Photo
                record सापडला नाही.
              </p>

            </div>

          ) : (

            <div className="main-register-table-wrapper">

              <table className="main-register-table">

                <thead>
                  <tr>

                    <th>
                      SR.
                    </th>

                    <th>
                      DATE
                    </th>

                    <th>
                      MANAGER
                    </th>

                    <th>
                      MANAGER ID
                    </th>

                    <th>
                      SUB ADMIN
                    </th>

                    <th>
                      SUB ADMIN ID
                    </th>

                    <th>
                      REGISTER PHOTO
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map(
                    (
                      record,
                      index
                    ) => {

                      const manager =
                        getManager(
                          record.managerId
                        );

                      const subAdmin =
                        getSubAdmin(
                          record.subAdminId
                        );

                      // =====================
                      // MANAGER DISPLAY
                      // =====================

                      const managerName =
                        manager?.name ||
                        manager?.managerName ||
                        "Manager";

                      const managerUserId =
                        manager?.userId ||
                        manager?.managerId ||
                        `DB-${record.managerId}`;

                      // =====================
                      // SUB ADMIN DISPLAY
                      // =====================

                      const subAdminName =
                        subAdmin?.name ||
                        subAdmin?.subAdminName ||
                        "Sub Admin";

                      const subAdminUserId =
                        subAdmin?.subAdminId ||
                        subAdmin?.userId ||
                        `DB-${record.subAdminId}`;

                      return (
                        <tr
                          key={
                            record.id
                          }
                        >

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
                            <div className="main-register-manager">

                              <div className="main-register-avatar">
                                {managerName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <strong>
                                {managerName}
                              </strong>

                            </div>
                          </td>

                          {/* MANAGER ID */}

                          <td>
                            <span className="main-register-manager-id">
                              {managerUserId}
                            </span>
                          </td>

                          {/* SUB ADMIN */}

                          <td>
                            <strong>
                              {subAdminName}
                            </strong>
                          </td>

                          {/* SUB ADMIN ID */}

                          <td>
                            <span className="main-register-manager-id">
                              {subAdminUserId}
                            </span>
                          </td>

                          {/* REGISTER PHOTO */}

                          <td>

                            <button
                              type="button"
                              className="main-register-view"
                              disabled={
                                viewerLoading
                              }
                              onClick={() =>
                                handleViewPhoto(
                                  record.id
                                )
                              }
                            >
                              👁 VIEW
                            </button>

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

      {/* =====================================
          REGISTER PHOTO VIEWER
      ===================================== */}

      {viewerOpen && (

        <div
          style={{
            position: "fixed",
            inset: 0,

            background:
              "rgba(0,0,0,0.88)",

            zIndex: 10000,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            padding: "16px",
          }}
        >

          <div
            style={{
              width:
                "min(900px, 100%)",

              maxHeight: "95vh",

              overflowY: "auto",

              background: "#ffffff",

              borderRadius: "16px",

              padding: "20px",
            }}
          >

            {/* VIEWER HEADER */}

            <div
              style={{
                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",

                gap: "12px",

                marginBottom: "16px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                }}
              >
                Register Photo
              </h2>

              <button
                type="button"
                onClick={
                  closeViewer
                }
                style={{
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>

            </div>

            {/* PHOTO */}

            <div
              style={{
                width: "100%",

                minHeight: "300px",

                background: "#f5f5f5",

                borderRadius: "12px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                overflow: "hidden",
              }}
            >

              <img
                src={viewerUrl}
                alt="Register"
                style={{
                  width: "100%",

                  maxHeight: "68vh",

                  objectFit: "contain",

                  display: "block",
                }}
              />

            </div>

            {/* DOWNLOAD / CLOSE */}

            <div
              style={{
                display: "flex",

                justifyContent:
                  "center",

                alignItems: "center",

                gap: "12px",

                flexWrap: "wrap",

                marginTop: "18px",
              }}
            >

              {viewerDownloadUrl && (

                <button
                  type="button"
                  className="main-register-view"
                  onClick={
                    handleViewerDownload
                  }
                >
                  ⬇ DOWNLOAD PHOTO
                </button>

              )}

              <button
                type="button"
                onClick={
                  closeViewer
                }
              >
                CLOSE
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AllRegisterPhotos;