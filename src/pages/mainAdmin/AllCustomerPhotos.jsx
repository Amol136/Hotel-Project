import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/tables.css";

function AllCustomerPhotos() {
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

  const [searchDate, setSearchDate] =
    useState("");

  const [
    searchSubAdmin,
    setSearchSubAdmin,
  ] = useState("");

  const [
    searchManager,
    setSearchManager,
  ] = useState("");

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

  const [viewerTitle, setViewerTitle] =
    useState("");

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
          subAdminsResponse,
          managersResponse,
        ] = await Promise.all([
          apiFetch(
            `/api/customer-ids/main-admin/${mainAdminId}`
          ),

          apiFetch(
            "/api/users/sub-admins"
          ),

          apiFetch(
            "/api/users/managers"
          ),
        ]);

        if (!recordsResponse.ok) {
          const message =
            await recordsResponse.text();

          throw new Error(
            message ||
              "Customer ID records load झाले नाहीत."
          );
        }

        if (!subAdminsResponse.ok) {
          const message =
            await subAdminsResponse.text();

          throw new Error(
            message ||
              "Sub Admin list load झाली नाही."
          );
        }

        if (!managersResponse.ok) {
          const message =
            await managersResponse.text();

          throw new Error(
            message ||
              "Manager list load झाली नाही."
          );
        }

        const recordsData =
          await recordsResponse.json();

        const subAdminsData =
          await subAdminsResponse.json();

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

        setSubAdmins(
          Array.isArray(subAdminsData)
            ? subAdminsData
            : []
        );

        setManagers(
          Array.isArray(managersData)
            ? managersData
            : []
        );
      } catch (err) {
        console.error(
          "All Customer Photos Load Error:",
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
  // FILTER RECORDS
  // STATUS FILTER REMOVED
  // =====================================

  const filteredRecords =
    useMemo(() => {
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

          const dateText =
            searchDate
              .trim()
              .toLowerCase();

          const subAdminText =
            searchSubAdmin
              .trim()
              .toLowerCase();

          const managerText =
            searchManager
              .trim()
              .toLowerCase();

          // DATE

          const matchesDate =
            !dateText ||
            String(
              record.date || ""
            )
              .toLowerCase()
              .includes(dateText);

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

          const matchesSubAdmin =
            !subAdminText ||
            subAdminName.includes(
              subAdminText
            ) ||
            subAdminUserId.includes(
              subAdminText
            );

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
            matchesSubAdmin &&
            matchesManager
          );
        }
      );
    }, [
      records,
      managers,
      subAdmins,
      searchDate,
      searchSubAdmin,
      searchManager,
    ]);

  // =====================================
  // OPEN PHOTO VIEWER
  // FRONT / BACK
  // =====================================

  const openPhotoViewer = async (
    recordId,
    side
  ) => {
    try {
      if (!mainAdminId) {
        throw new Error(
          "Main Admin login माहिती मिळाली नाही."
        );
      }

      setViewerLoading(true);
      setError("");

      const isFront =
        side === "front";

      const viewEndpoint =
        isFront
          ? `/api/customer-ids/${recordId}/main-admin-front-url?mainAdminId=${mainAdminId}`
          : `/api/customer-ids/${recordId}/main-admin-back-url?mainAdminId=${mainAdminId}`;

      const downloadEndpoint =
        isFront
          ? `/api/customer-ids/${recordId}/main-admin-front-download-url?mainAdminId=${mainAdminId}`
          : `/api/customer-ids/${recordId}/main-admin-back-download-url?mainAdminId=${mainAdminId}`;

      const [
        viewResponse,
        downloadResponse,
      ] = await Promise.all([
        apiFetch(viewEndpoint),
        apiFetch(downloadEndpoint),
      ]);

      if (!viewResponse.ok) {
        const message =
          await viewResponse.text();

        throw new Error(
          message ||
            "Photo open झाली नाही."
        );
      }

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

      setViewerTitle(
        isFront
          ? "Customer ID - Front Photo"
          : "Customer ID - Back Photo"
      );

      setViewerOpen(true);
    } catch (err) {
      console.error(
        "Photo Viewer Error:",
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

  const downloadViewerPhoto = () => {
    if (!viewerDownloadUrl) {
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
      <div className="all-customer-page">
        <div className="all-customer-empty">
          <h3>
            Loading Customer Records...
          </h3>
        </div>
      </div>
    );
  }

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="all-customer-page">

      {/* =================================
          HEADER
      ================================= */}

      <header className="all-customer-header">
        <div>
          <span>
            MAIN ADMIN / CUSTOMER RECORDS
          </span>

          <h1>
            All Customer ID Photos
          </h1>

          <p>
            सर्व Managers ने Upload केलेले
            Customer ID records
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

      <main className="all-customer-container">

        {/* =================================
            ERROR
        ================================= */}

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

        {/* =================================
            SUMMARY
            STATUS CARDS REMOVED
        ================================= */}

        <section className="all-customer-summary">
          <div>
            <small>
              TOTAL RECORDS
            </small>

            <strong>
              {records.length}
            </strong>
          </div>

          <div className="customer-manager-card">
            <small>
              MANAGERS
            </small>

            <strong>
              {managers.length}
            </strong>
          </div>
        </section>

        {/* =================================
            TOOLBAR
        ================================= */}

        <section className="all-customer-toolbar">
          <div>
            <h2>
              Customer ID Records
            </h2>

            <p>
              Date, Sub Admin आणि Manager
              नुसार search करा
            </p>
          </div>
        </section>

        {/* =================================
            SEARCH FILTERS
            STATUS REMOVED
        ================================= */}

        <section className="customer-search-filters">

          {/* DATE */}

          <div className="customer-filter-field">
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

          {/* SUB ADMIN */}

          <div className="customer-filter-field">
            <label>
              SEARCH BY SUB ADMIN
            </label>

            <input
              type="text"
              placeholder="Sub Admin name or ID..."
              value={searchSubAdmin}
              onChange={(event) =>
                setSearchSubAdmin(
                  event.target.value
                )
              }
            />
          </div>

          {/* MANAGER */}

          <div className="customer-filter-field">
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

        </section>

        {/* =================================
            TABLE
        ================================= */}

        <section className="all-customer-table-card">

          {filteredRecords.length === 0 ? (
            <div className="all-customer-empty">
              <div>
                🪪
              </div>

              <h3>
                Customer ID Record नाही
              </h3>

              <p>
                Search प्रमाणे Customer ID
                record सापडला नाही.
              </p>
            </div>
          ) : (
            <div className="all-customer-table-wrapper">

              <table className="all-customer-table">

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
                      SUB ADMIN
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
                    ) => {

                      const manager =
                        getManager(
                          record.managerId
                        );

                      const subAdmin =
                        getSubAdmin(
                          record.subAdminId
                        );

                      // MANAGER

                      const managerName =
                        manager?.name ||
                        manager?.managerName ||
                        "Manager";

                      const managerUserId =
                        manager?.userId ||
                        manager?.managerId ||
                        `DB-${record.managerId}`;

                      // SUB ADMIN

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
                            <div className="customer-manager-info">

                              <div className="customer-manager-avatar">
                                {managerName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {managerName}
                                </strong>

                                <br />

                                <small>
                                  {managerUserId}
                                </small>
                              </div>

                            </div>
                          </td>

                          {/* SUB ADMIN */}

                          <td>
                            <div>
                              <strong>
                                {subAdminName}
                              </strong>

                              <br />

                              <small>
                                {subAdminUserId}
                              </small>
                            </div>
                          </td>

                          {/* FRONT PHOTO */}

                          <td>
                            <button
                              type="button"
                              className="customer-front-view"
                              disabled={
                                viewerLoading
                              }
                              onClick={() =>
                                openPhotoViewer(
                                  record.id,
                                  "front"
                                )
                              }
                            >
                              👁 VIEW FRONT
                            </button>
                          </td>

                          {/* BACK PHOTO */}

                          <td>
                            <button
                              type="button"
                              className="customer-back-view"
                              disabled={
                                viewerLoading
                              }
                              onClick={() =>
                                openPhotoViewer(
                                  record.id,
                                  "back"
                                )
                              }
                            >
                              👁 VIEW BACK
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

      {/* =================================
          PHOTO VIEWER
      ================================= */}

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
                  display: "block",

                  width: "100%",

                  maxHeight: "68vh",

                  objectFit: "contain",
                }}
              />

            </div>

            {/* VIEWER BUTTONS */}

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
                  photo viewer मध्ये आहे */}

              {viewerDownloadUrl && (
                <button
                  type="button"
                  className="customer-front-view"
                  onClick={
                    downloadViewerPhoto
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

export default AllCustomerPhotos;