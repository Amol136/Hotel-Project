import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/tables.css";

function CustomerPhotos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================
  // LOGGED-IN SUB ADMIN
  // =====================================

  const currentSubAdminId = user?.id;

  // =====================================
  // DATA
  // =====================================

  const [records, setRecords] =
    useState([]);

  const [managers, setManagers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================
  // SEARCH
  // =====================================

  const [searchDate, setSearchDate] =
    useState("");

  const [
    searchManager,
    setSearchManager,
  ] = useState("");

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
    viewerTitle,
    setViewerTitle,
  ] = useState("");

  const [
    viewerLoading,
    setViewerLoading,
  ] = useState(false);

  // =====================================
  // LOAD DATA FROM BACKEND
  // =====================================

  useEffect(() => {
    if (!currentSubAdminId) {
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
        ] = await Promise.all([
          apiFetch(
            `/api/customer-ids/sub-admin/${currentSubAdminId}`
          ),

          apiFetch(
            `/api/users/sub-admins/${currentSubAdminId}/managers`
          ),
        ]);

        // CUSTOMER ID RECORDS

        if (!recordsResponse.ok) {
          const message =
            await recordsResponse.text();

          throw new Error(
            message ||
              "Customer ID records load झाले नाहीत."
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

        const recordsData =
          await recordsResponse.json();

        const managersData =
          await managersResponse.json();

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
      } catch (err) {
        console.error(
          "Customer Photos Load Error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Customer ID Photos load करताना error आला."
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
  }, [currentSubAdminId]);

  // =====================================
  // MANAGER LOOKUP
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
  // GET MANAGER NAME
  // =====================================

  const getManagerName = (
    managerDatabaseId
  ) => {
    const manager =
      getManager(managerDatabaseId);

    return (
      manager?.managerName ||
      manager?.name ||
      "Manager"
    );
  };

  // =====================================
  // GET MANAGER USER ID
  // =====================================

  const getManagerUserId = (
    managerDatabaseId
  ) => {
    const manager =
      getManager(managerDatabaseId);

    return (
      manager?.managerId ||
      manager?.userId ||
      "-"
    );
  };

  // =====================================
  // FILTER RECORDS
  // STATUS FILTER REMOVED
  // =====================================

  const filteredRecords =
    useMemo(() => {
      const dateText =
        searchDate
          .toLowerCase()
          .trim();

      const managerText =
        searchManager
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

          // DATE FILTER

          const recordDate =
            String(
              record.date || ""
            ).toLowerCase();

          const matchesDate =
            !dateText ||
            recordDate.includes(
              dateText
            );

          // MANAGER FILTER

          const managerName =
            String(
              manager?.managerName ||
                manager?.name ||
                ""
            ).toLowerCase();

          const managerUserId =
            String(
              manager?.managerId ||
                manager?.userId ||
                ""
            ).toLowerCase();

          const matchesManager =
            !managerText ||
            managerName.includes(
              managerText
            ) ||
            managerUserId.includes(
              managerText
            );

          return (
            matchesDate &&
            matchesManager
          );
        }
      );
    }, [
      records,
      managers,
      searchDate,
      searchManager,
    ]);

  // =====================================
  // OPEN PHOTO VIEWER
  // =====================================

  const handleViewPhoto = async (
    side,
    record
  ) => {
    try {
      if (!currentSubAdminId) {
        throw new Error(
          "Sub Admin login information मिळाली नाही."
        );
      }

      setViewerLoading(true);
      setError("");

      let viewEndpoint = "";
      let downloadEndpoint = "";

      // FRONT PHOTO

      if (side === "Front") {
        viewEndpoint =
          `/api/customer-ids/${record.id}/sub-admin-front-url` +
          `?subAdminId=${currentSubAdminId}`;

        downloadEndpoint =
          `/api/customer-ids/${record.id}/sub-admin-front-download-url` +
          `?subAdminId=${currentSubAdminId}`;
      }

      // BACK PHOTO

      else {
        viewEndpoint =
          `/api/customer-ids/${record.id}/sub-admin-back-url` +
          `?subAdminId=${currentSubAdminId}`;

        downloadEndpoint =
          `/api/customer-ids/${record.id}/sub-admin-back-download-url` +
          `?subAdminId=${currentSubAdminId}`;
      }

      // VIEW + DOWNLOAD URL

      const [
        viewResponse,
        downloadResponse,
      ] = await Promise.all([
        apiFetch(viewEndpoint),
        apiFetch(downloadEndpoint),
      ]);

      // VIEW CHECK

      if (!viewResponse.ok) {
        const message =
          await viewResponse.text();

        throw new Error(
          message ||
            `${side} photo open झाला नाही.`
        );
      }

      // DOWNLOAD CHECK

      if (!downloadResponse.ok) {
        const message =
          await downloadResponse.text();

        throw new Error(
          message ||
            `${side} photo download URL मिळाला नाही.`
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

      // VIEWER DATA

      setViewerUrl(
        viewData.url
      );

      setViewerDownloadUrl(
        downloadData?.url || ""
      );

      setViewerTitle(
        side === "Front"
          ? "Customer ID - Front Photo"
          : "Customer ID - Back Photo"
      );

      setViewerOpen(true);
    } catch (err) {
      console.error(
        `${side} Photo View Error:`,
        err
      );

      window.alert(
        err.message ||
          `${side} photo open करताना error आला.`
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
    setViewerTitle("");
  };

  // =====================================
  // DOWNLOAD FROM VIEWER
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
              {user?.name ||
                "Sub Admin"}
            </strong>
          </div>

          <span>
            {user?.userId ||
              user?.subAdminId ||
              currentSubAdminId ||
              "-"}
          </span>

        </section>

        {/* =========================
            SUMMARY
            STATUS COUNTS REMOVED
        ========================= */}

        <section className="photo-summary-grid">

          <div className="photo-summary-card">

            <small>
              TOTAL RECORDS
            </small>

            <strong>
              {records.length}
            </strong>

          </div>

          <div className="photo-summary-card">

            <small>
              TOTAL MANAGERS
            </small>

            <strong>
              {managers.length}
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
              Date आणि Manager नुसार search करा
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

          </div>

        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#fff1f1",
              color: "#b42318",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            TABLE
        ========================= */}

        <section className="sub-photo-table-card">

          {loading ? (

            <div className="sub-photo-empty">

              <div>
                ⏳
              </div>

              <h3>
                Customer records loading...
              </h3>

              <p>
                कृपया थोडे थांबा.
              </p>

            </div>

          ) : filteredRecords.length === 0 ? (

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
                      FRONT PHOTO
                    </th>

                    <th>
                      BACK PHOTO
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
                          {getManagerName(
                            record.managerId
                          )}
                        </td>

                        {/* MANAGER ID */}

                        <td>
                          <span className="sub-manager-id">

                            {getManagerUserId(
                              record.managerId
                            )}

                          </span>
                        </td>

                        {/* =====================
                            FRONT PHOTO
                        ===================== */}

                        <td>

                          <button
                            type="button"
                            className="front-photo-button"
                            disabled={
                              viewerLoading
                            }
                            onClick={() =>
                              handleViewPhoto(
                                "Front",
                                record
                              )
                            }
                          >
                            👁 VIEW FRONT
                          </button>

                        </td>

                        {/* =====================
                            BACK PHOTO
                        ===================== */}

                        <td>

                          <button
                            type="button"
                            className="back-photo-button"
                            disabled={
                              viewerLoading
                            }
                            onClick={() =>
                              handleViewPhoto(
                                "Back",
                                record
                              )
                            }
                          >
                            👁 VIEW BACK
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
                {viewerTitle}
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
                alt={viewerTitle}
                style={{
                  width: "100%",

                  maxHeight: "68vh",

                  objectFit: "contain",

                  display: "block",
                }}
              />

            </div>

            {/* =========================
                DOWNLOAD + CLOSE
            ========================= */}

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

              {/* DOWNLOAD आता फक्त
                  PHOTO OPEN झाल्यावर दिसेल */}

              {viewerDownloadUrl && (

                <button
                  type="button"
                  className={
                    viewerTitle.includes(
                      "Front"
                    )
                      ? "front-photo-button"
                      : "back-photo-button"
                  }
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

export default CustomerPhotos;