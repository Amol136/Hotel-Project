import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/tables.css";

function RegisterPhotos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================
  // LOGGED-IN SUB ADMIN
  // =====================================

  const currentSubAdminId = user?.id;

  // =====================================
  // STATES
  // =====================================

  const [search, setSearch] =
    useState("");

  const [records, setRecords] =
    useState([]);

  const [managers, setManagers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================
  // PHOTO VIEWER
  // =====================================

  const [
    viewerOpen,
    setViewerOpen,
  ] = useState(false);

  const [
    viewerUrl,
    setViewerUrl,
  ] = useState("");

  const [
    viewerDownloadUrl,
    setViewerDownloadUrl,
  ] = useState("");

  const [
    viewerLoading,
    setViewerLoading,
  ] = useState(false);

  // =====================================
  // LOAD DATA FROM BACKEND
  // =====================================

  useEffect(() => {
    if (
      !currentSubAdminId ||
      user?.role !== "SUB_ADMIN"
    ) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setError("");
        setLoading(true);

        const [
          registerResponse,
          managersResponse,
        ] = await Promise.all([
          apiFetch(
            `/api/register-photos/sub-admin/${currentSubAdminId}`
          ),

          apiFetch(
            `/api/users/sub-admins/${currentSubAdminId}/managers`
          ),
        ]);

        // REGISTER PHOTOS CHECK

        if (!registerResponse.ok) {
          const errorText =
            await registerResponse.text();

          throw new Error(
            errorText ||
              "Register Photos load झाले नाहीत."
          );
        }

        // MANAGERS CHECK

        if (!managersResponse.ok) {
          const errorText =
            await managersResponse.text();

          throw new Error(
            errorText ||
              "Managers load झाले नाहीत."
          );
        }

        const registerData =
          await registerResponse.json();

        const managersData =
          await managersResponse.json();

        if (cancelled) {
          return;
        }

        setRecords(
          Array.isArray(registerData)
            ? registerData
            : []
        );

        setManagers(
          Array.isArray(managersData)
            ? managersData
            : []
        );
      } catch (err) {
        console.error(
          "Register Photos Load Error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Data load करताना error आला."
          );
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
    currentSubAdminId,
    user?.role,
  ]);

  // =====================================
  // SEARCH
  // =====================================

  const filteredRecords =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return records;
      }

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

          const recordDate =
            String(
              record.date || ""
            ).toLowerCase();

          return (
            managerName.includes(
              searchText
            ) ||
            managerUserId.includes(
              searchText
            ) ||
            String(
              record.managerId
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            recordDate.includes(
              searchText
            )
          );
        }
      );
    }, [
      search,
      records,
      managers,
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
  // MANAGER NAME
  // =====================================

  const getManagerName = (
    managerDatabaseId
  ) => {
    const manager =
      getManager(
        managerDatabaseId
      );

    return (
      manager?.name ||
      manager?.managerName ||
      "Manager"
    );
  };

  // =====================================
  // MANAGER USER ID
  // =====================================

  const getManagerUserId = (
    managerDatabaseId
  ) => {
    const manager =
      getManager(
        managerDatabaseId
      );

    return (
      manager?.userId ||
      manager?.managerId ||
      `DB-${managerDatabaseId}`
    );
  };

  // =====================================
  // VIEW PHOTO
  // VIEW + DOWNLOAD URL
  // =====================================

  const handleViewPhoto =
    async (record) => {
      try {
        setError("");

        if (!currentSubAdminId) {
          window.alert(
            "Sub Admin login information मिळाली नाही."
          );

          return;
        }

        // =================================
        // FRONTEND OWNERSHIP CHECK
        // =================================

        if (
          Number(
            record.subAdminId
          ) !==
          Number(
            currentSubAdminId
          )
        ) {
          window.alert(
            "या Register Photo वर तुम्हाला access नाही."
          );

          return;
        }

        setViewerLoading(true);

        // =================================
        // GET VIEW + DOWNLOAD URL
        // =================================

        const [
          viewResponse,
          downloadResponse,
        ] = await Promise.all([
          apiFetch(
            `/api/register-photos/${record.id}/sub-admin-photo-url?subAdminId=${currentSubAdminId}`
          ),

          apiFetch(
            `/api/register-photos/${record.id}/sub-admin-download-url?subAdminId=${currentSubAdminId}`
          ),
        ]);

        // =================================
        // VIEW RESPONSE CHECK
        // =================================

        if (!viewResponse.ok) {
          const errorText =
            await viewResponse.text();

          throw new Error(
            errorText ||
              "Photo open करता आला नाही."
          );
        }

        // =================================
        // DOWNLOAD RESPONSE CHECK
        // =================================

        if (!downloadResponse.ok) {
          const errorText =
            await downloadResponse.text();

          throw new Error(
            errorText ||
              "Download URL मिळाला नाही."
          );
        }

        const viewData =
          await viewResponse.json();

        const downloadData =
          await downloadResponse.json();

        if (!viewData?.url) {
          throw new Error(
            "Photo URL मिळाला नाही."
          );
        }

        // =================================
        // OPEN PHOTO VIEWER
        // =================================

        setViewerUrl(
          viewData.url
        );

        setViewerDownloadUrl(
          downloadData?.url || ""
        );

        setViewerOpen(true);
      } catch (err) {
        console.error(
          "Register Photo View Error:",
          err
        );

        window.alert(
          err.message ||
            "Photo open करताना error आला."
        );
      } finally {
        setViewerLoading(false);
      }
    };

  // =====================================
  // CLOSE PHOTO VIEWER
  // =====================================

  const closeViewer = () => {
    setViewerOpen(false);

    setViewerUrl("");

    setViewerDownloadUrl("");
  };

  // =====================================
  // DOWNLOAD FROM PHOTO VIEWER
  // =====================================

  const handleViewerDownload = () => {
    if (!viewerDownloadUrl) {
      window.alert(
        "Download URL मिळाला नाही."
      );

      return;
    }

    window.location.href =
      viewerDownloadUrl;
  };

  // =====================================
  // UI
  // =====================================

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
              {user?.name ||
                "Sub Admin"}
            </strong>

          </div>

          <span>
            {user?.userId ||
              user?.subAdminId ||
              `DB ID: ${
                currentSubAdminId ||
                "-"
              }`}
          </span>

        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div
            style={{
              marginBottom:
                "16px",

              padding:
                "12px 16px",

              borderRadius:
                "10px",

              background:
                "#fee2e2",

              color:
                "#991b1b",

              fontWeight:
                "600",
            }}
          >
            {error}
          </div>

        )}

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="register-summary">

          <div className="register-summary-card">

            <small>
              TOTAL REGISTER PHOTOS
            </small>

            <strong>
              {records.length}
            </strong>

          </div>

          <div className="register-summary-card manager-count">

            <small>
              MY MANAGERS
            </small>

            <strong>
              {managers.length}
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

          {loading ? (

            <div className="register-admin-empty">

              <div>
                ⏳
              </div>

              <h3>
                Loading...
              </h3>

              <p>
                Register Photos load होत आहेत.
              </p>

            </div>

          ) : filteredRecords.length === 0 ? (

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
                      REGISTER PHOTO
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRecords.map(
                    (
                      record,
                      index
                    ) => (

                      <tr
                        key={record.id}
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

                        {/* MANAGER ID */}

                        <td>

                          <span className="register-manager-id">

                            {getManagerUserId(
                              record.managerId
                            )}

                          </span>

                        </td>

                        {/* REGISTER PHOTO */}

                        <td>

                          <button
                            type="button"
                            className="register-view-button"
                            disabled={
                              viewerLoading
                            }
                            onClick={() =>
                              handleViewPhoto(
                                record
                              )
                            }
                          >
                            📷 VIEW PHOTO
                          </button>

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

      {/* =====================================
          PHOTO VIEWER
      ===================================== */}

      {viewerOpen && (

        <div
          style={{
            position: "fixed",

            inset: 0,

            background:
              "rgba(0, 0, 0, 0.88)",

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

              maxHeight:
                "95vh",

              overflowY:
                "auto",

              background:
                "#ffffff",

              borderRadius:
                "16px",

              padding:
                "20px",

              boxShadow:
                "0 20px 60px rgba(0,0,0,0.35)",
            }}
          >

            {/* =========================
                VIEWER HEADER
            ========================= */}

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                gap:
                  "12px",

                marginBottom:
                  "16px",
              }}
            >

              <div>

                <small
                  style={{
                    color:
                      "#64748b",

                    fontWeight:
                      "700",
                  }}
                >
                  REGISTER PHOTO
                </small>

                <h2
                  style={{
                    margin:
                      "4px 0 0",
                  }}
                >
                  Register Photo
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeViewer
                }
                style={{
                  border:
                    "none",

                  background:
                    "#f1f5f9",

                  width:
                    "42px",

                  height:
                    "42px",

                  borderRadius:
                    "50%",

                  cursor:
                    "pointer",

                  fontSize:
                    "20px",
                }}
              >
                ✕
              </button>

            </div>

            {/* =========================
                PHOTO
            ========================= */}

            <div
              style={{
                width:
                  "100%",

                minHeight:
                  "300px",

                background:
                  "#f8fafc",

                borderRadius:
                  "14px",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                overflow:
                  "hidden",

                border:
                  "1px solid #e2e8f0",
              }}
            >

              <img
                src={
                  viewerUrl
                }
                alt="Register"
                style={{
                  width:
                    "100%",

                  maxHeight:
                    "68vh",

                  objectFit:
                    "contain",

                  display:
                    "block",
                }}
              />

            </div>

            {/* =========================
                DOWNLOAD + CLOSE
            ========================= */}

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",

                gap:
                  "12px",

                flexWrap:
                  "wrap",

                marginTop:
                  "20px",
              }}
            >

              {/* DOWNLOAD BUTTON
                  आता फक्त PHOTO VIEWER
                  मध्ये दिसेल */}

              {viewerDownloadUrl && (

                <button
                  type="button"
                  className="register-view-button"
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
                style={{
                  padding:
                    "10px 22px",

                  border:
                    "1px solid #cbd5e1",

                  background:
                    "#ffffff",

                  borderRadius:
                    "8px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "700",
                }}
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

export default RegisterPhotos;