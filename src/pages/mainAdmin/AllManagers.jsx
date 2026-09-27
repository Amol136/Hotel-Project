import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/tables.css";

function AllManagers() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================
  // LOGGED-IN MAIN ADMIN
  // =====================================

  const mainAdminId = user?.id;

  // =====================================
  // STATES
  // =====================================

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [managers, setManagers] =
    useState([]);

  const [subAdmins, setSubAdmins] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================
  // LOAD MANAGERS + SUB ADMINS
  // PostgreSQL + JWT
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
        const [
          managersResponse,
          subAdminsResponse,
        ] = await Promise.all([
          apiFetch(
            "/api/users/managers"
          ),

          apiFetch(
            "/api/users/sub-admins"
          ),
        ]);

        // ================================
        // MANAGERS CHECK
        // ================================

        if (!managersResponse.ok) {
          const message =
            await managersResponse.text();

          throw new Error(
            message ||
              "Manager list load झाली नाही."
          );
        }

        // ================================
        // SUB ADMINS CHECK
        // ================================

        if (!subAdminsResponse.ok) {
          const message =
            await subAdminsResponse.text();

          throw new Error(
            message ||
              "Sub Admin list load झाली नाही."
          );
        }

        // ================================
        // JSON DATA
        // ================================

        const managersData =
          await managersResponse.json();

        const subAdminsData =
          await subAdminsResponse.json();

        if (cancelled) {
          return;
        }

        // ================================
        // SAVE DATA
        // ================================

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
          "All Managers Load Error:",
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
                "Managers load करताना error आला."
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
  // GET SUB ADMIN
  // createdBySubAdminId = PostgreSQL ID
  // =====================================

  const getSubAdmin = (
    subAdminDatabaseId
  ) => {
    return subAdmins.find(
      (item) =>
        Number(item.id) ===
        Number(subAdminDatabaseId)
    );
  };

  // =====================================
  // NORMALIZE MANAGER VALUES
  // Supports current backend response
  // =====================================

  const getManagerName = (
    manager
  ) => {
    return (
      manager?.managerName ||
      manager?.name ||
      "Manager"
    );
  };

  const getManagerUserId = (
    manager
  ) => {
    return (
      manager?.managerId ||
      manager?.userId ||
      "-"
    );
  };

  const getManagerStatus = (
    manager
  ) => {
    // Backend User entity uses active boolean.
    // Also supports status if DTO returns it.

    if (
      manager?.status ===
        "ACTIVE" ||
      manager?.status ===
        "INACTIVE"
    ) {
      return manager.status;
    }

    return manager?.active === false
      ? "INACTIVE"
      : "ACTIVE";
  };

  // =====================================
  // FILTER MANAGERS
  // =====================================

  const filteredManagers =
    useMemo(() => {
      const text =
        search
          .toLowerCase()
          .trim();

      return managers.filter(
        (manager) => {
          const subAdmin =
            subAdmins.find(
              (item) =>
                Number(item.id) ===
                Number(
                  manager.createdBySubAdminId
                )
            );

          const managerName =
            String(
              manager.managerName ||
                manager.name ||
                ""
            ).toLowerCase();

          const managerId =
            String(
              manager.managerId ||
                manager.userId ||
                ""
            ).toLowerCase();

          const mobile =
            String(
              manager.mobile || ""
            ).toLowerCase();

          const email =
            String(
              manager.email || ""
            ).toLowerCase();

          const subAdminName =
            String(
              subAdmin?.name ||
                subAdmin?.subAdminName ||
                ""
            ).toLowerCase();

          const subAdminId =
            String(
              subAdmin?.subAdminId ||
                subAdmin?.userId ||
                ""
            ).toLowerCase();

          // ==============================
          // SEARCH
          // ==============================

          const matchesSearch =
            !text ||
            managerName.includes(text) ||
            managerId.includes(text) ||
            mobile.includes(text) ||
            email.includes(text) ||
            subAdminName.includes(text) ||
            subAdminId.includes(text);

          // ==============================
          // STATUS
          // ==============================

          const managerStatus =
            manager.status ===
              "ACTIVE" ||
            manager.status ===
              "INACTIVE"
              ? manager.status
              : manager.active === false
              ? "INACTIVE"
              : "ACTIVE";

          const matchesStatus =
            statusFilter === "ALL" ||
            managerStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      managers,
      subAdmins,
      search,
      statusFilter,
    ]);

  // =====================================
  // SUMMARY
  // =====================================

  const activeManagers =
    managers.filter(
      (manager) =>
        getManagerStatus(manager) ===
        "ACTIVE"
    ).length;

  const inactiveManagers =
    managers.filter(
      (manager) =>
        getManagerStatus(manager) ===
        "INACTIVE"
    ).length;

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="all-managers-page">

        <div className="all-managers-empty">

          <h3>
            Loading Managers...
          </h3>

        </div>

      </div>
    );
  }

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="all-managers-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="all-managers-header">

        <div>

          <span>
            MAIN ADMIN / MANAGERS
          </span>

          <h1>
            All Managers
          </h1>

          <p>
            सर्व Sub Admin अंतर्गत असलेले Managers
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

      <main className="all-managers-container">

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
                "8px",

              background:
                "#ffe5e5",

              color:
                "#a40000",

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

        <section className="all-managers-summary">

          <div>

            <small>
              TOTAL MANAGERS
            </small>

            <strong>
              {managers.length}
            </strong>

          </div>

          <div className="all-manager-active">

            <small>
              ACTIVE
            </small>

            <strong>
              {activeManagers}
            </strong>

          </div>

          <div className="all-manager-inactive">

            <small>
              INACTIVE
            </small>

            <strong>
              {inactiveManagers}
            </strong>

          </div>

          <div className="all-manager-subadmins">

            <small>
              SUB ADMINS
            </small>

            <strong>
              {subAdmins.length}
            </strong>

          </div>

        </section>

        {/* =========================
            SEARCH + FILTER
        ========================= */}

        <section className="all-managers-toolbar">

          <div>

            <h2>
              Manager Accounts
            </h2>

            <p>
              Manager किंवा Sub Admin ने search करा
            </p>

          </div>

          <div className="all-manager-filters">

            <input
              type="text"
              placeholder="Search manager..."
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

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>

          </div>

        </section>

        {/* =========================
            TABLE
        ========================= */}

        <section className="all-managers-table-card">

          {filteredManagers.length ===
          0 ? (

            <div className="all-managers-empty">

              <div>
                👥
              </div>

              <h3>
                Manager सापडला नाही
              </h3>

              <p>
                Sub Admin ने Manager तयार केल्यानंतर
                येथे दिसेल.
              </p>

            </div>

          ) : (

            <div className="all-managers-table-wrapper">

              <table className="all-managers-table">

                <thead>

                  <tr>

                    <th>
                      SR.
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
                      MOBILE
                    </th>

                    <th>
                      EMAIL
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredManagers.map(
                    (
                      manager,
                      index
                    ) => {
                      const subAdmin =
                        getSubAdmin(
                          manager.createdBySubAdminId
                        );

                      const managerName =
                        getManagerName(
                          manager
                        );

                      const managerUserId =
                        getManagerUserId(
                          manager
                        );

                      const managerStatus =
                        getManagerStatus(
                          manager
                        );

                      const subAdminName =
                        subAdmin?.name ||
                        subAdmin?.subAdminName ||
                        "Sub Admin";

                      const subAdminUserId =
                        subAdmin?.subAdminId ||
                        subAdmin?.userId ||
                        (
                          manager.createdBySubAdminId
                            ? `DB-${manager.createdBySubAdminId}`
                            : "-"
                        );

                      return (
                        <tr
                          key={
                            manager.id
                          }
                        >

                          {/* SR */}

                          <td>
                            {index + 1}
                          </td>

                          {/* MANAGER */}

                          <td>

                            <div className="all-manager-name">

                              <div className="all-manager-avatar">

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

                            <span className="all-manager-id">

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

                            <span className="all-manager-id">

                              {subAdminUserId}

                            </span>

                          </td>

                          {/* MOBILE */}

                          <td>
                            {manager.mobile ||
                              "-"}
                          </td>

                          {/* EMAIL */}

                          <td>
                            {manager.email ||
                              "-"}
                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                managerStatus ===
                                "ACTIVE"
                                  ? "all-manager-status active"
                                  : "all-manager-status inactive"
                              }
                            >
                              {managerStatus}
                            </span>

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

    </div>
  );
}

export default AllManagers;