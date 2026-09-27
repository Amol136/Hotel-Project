import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/tables.css";

function ManagerList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================
  // STATES
  // =====================================

  const [search, setSearch] = useState("");

  const [editingManager, setEditingManager] =
    useState(null);

  const [managers, setManagers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // =====================================
  // LOGGED-IN SUB ADMIN
  // =====================================

  // PostgreSQL database ID
  const currentSubAdminDbId =
    user?.id;

  // Display ID: SUBADMIN-001
  const currentSubAdminId =
    user?.subAdminId ||
    user?.userId;

  // =====================================
  // LOAD MANAGERS FROM BACKEND
  // JWT AUTOMATICALLY ADDED
  // =====================================

  useEffect(() => {
    let cancelled = false;

    const fetchManagers = async () => {
      if (!currentSubAdminDbId) {
        if (!cancelled) {
          setError(
            "Sub Admin login माहिती मिळाली नाही. कृपया पुन्हा login करा."
          );

          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await apiFetch(
            `/api/users/sub-admins/${currentSubAdminDbId}/managers`
          );

        if (!response.ok) {
          const errorText =
            await response.text();

          throw new Error(
            errorText ||
              "Manager list load करता आली नाही."
          );
        }

        const data =
          await response.json();

        if (!cancelled) {
          setManagers(
            Array.isArray(data)
              ? data
              : []
          );

          setError("");
        }
      } catch (err) {
        console.error(
          "Load Managers Error:",
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
                "Manager list load करताना error आला."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchManagers();

    return () => {
      cancelled = true;
    };
  }, [currentSubAdminDbId]);

  // =====================================
  // SEARCH
  // =====================================

  const filteredManagers =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return managers;
      }

      return managers.filter(
        (manager) => {
          return (
            manager.managerName
              ?.toLowerCase()
              .includes(
                searchText
              ) ||

            manager.managerId
              ?.toLowerCase()
              .includes(
                searchText
              ) ||

            manager.mobile
              ?.toLowerCase()
              .includes(
                searchText
              ) ||

            manager.email
              ?.toLowerCase()
              .includes(
                searchText
              )
          );
        }
      );
    }, [
      search,
      managers,
    ]);

  // =====================================
  // DELETE MANAGER
  // JWT AUTOMATICALLY ADDED
  // =====================================

  const handleDelete = async (
    managerId
  ) => {
    if (!currentSubAdminDbId) {
      setError(
        "Sub Admin login माहिती मिळाली नाही."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "हा Manager delete करायचा आहे का?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response =
        await apiFetch(
          `/api/users/sub-admins/${currentSubAdminDbId}/managers/${managerId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Manager delete करता आला नाही."
        );
      }

      setManagers(
        (previous) =>
          previous.filter(
            (manager) =>
              Number(
                manager.id
              ) !==
              Number(
                managerId
              )
          )
      );

      setMessage(
        "Manager यशस्वीरीत्या delete झाला."
      );
    } catch (err) {
      console.error(
        "Delete Manager Error:",
        err
      );

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
            "Manager delete करताना error आला."
        );
      }
    }
  };

  // =====================================
  // OPEN EDIT
  // =====================================

  const openEdit = (
    manager
  ) => {
    setError("");
    setMessage("");

    setEditingManager({
      ...manager,
    });
  };

  // =====================================
  // EDIT SAVE
  // JWT AUTOMATICALLY ADDED
  // =====================================

  const handleEditSave =
    async (event) => {
      event.preventDefault();

      if (!editingManager) {
        return;
      }

      if (!currentSubAdminDbId) {
        setError(
          "Sub Admin login माहिती मिळाली नाही."
        );

        return;
      }

      // ---------------------------------
      // VALIDATION
      // ---------------------------------

      if (
        !editingManager.managerName
          ?.trim() ||

        !editingManager.managerId
          ?.trim() ||

        !editingManager.mobile
          ?.trim() ||

        !editingManager.email
          ?.trim()
      ) {
        setError(
          "कृपया सर्व माहिती भरा."
        );

        return;
      }

      if (
        !/^[0-9]{10}$/.test(
          editingManager.mobile
        )
      ) {
        setError(
          "Mobile Number 10 अंकी असावा."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setMessage("");

        // =================================
        // UPDATE MANAGER API
        // =================================

        const response =
          await apiFetch(
            `/api/users/sub-admins/${currentSubAdminDbId}/managers/${editingManager.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                managerName:
                  editingManager
                    .managerName
                    .trim(),

                managerId:
                  editingManager
                    .managerId
                    .trim()
                    .toUpperCase(),

                mobile:
                  editingManager
                    .mobile
                    .trim(),

                email:
                  editingManager
                    .email
                    .trim()
                    .toLowerCase(),

                // Blank =
                // existing password unchanged
                password: "",

                createdBySubAdminId:
                  currentSubAdminDbId,
              }),
            }
          );

        if (!response.ok) {
          const errorText =
            await response.text();

          throw new Error(
            errorText ||
              "Manager update करता आला नाही."
          );
        }

        const updatedManager =
          await response.json();

        // =================================
        // UPDATE LOCAL STATE
        // =================================

        setManagers(
          (previous) =>
            previous.map(
              (manager) =>
                Number(
                  manager.id
                ) ===
                Number(
                  updatedManager.id
                )
                  ? updatedManager
                  : manager
            )
        );

        setEditingManager(
          null
        );

        setMessage(
          "Manager यशस्वीरीत्या update झाला."
        );
      } catch (err) {
        console.error(
          "Update Manager Error:",
          err
        );

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
              "Manager update करताना error आला."
          );
        }
      } finally {
        setSaving(false);
      }
    };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="manager-list-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="manager-list-header">

        <div>

          <span>
            SUB ADMIN
          </span>

          <h1>
            Manager List
          </h1>

          <p>
            तुम्ही तयार केलेले Managers manage करा
          </p>

        </div>

        <div className="manager-header-actions">

          <button
            type="button"
            className="manager-add-button"
            onClick={() =>
              navigate(
                "/sub-admin/create-manager"
              )
            }
          >
            + ADD MANAGER
          </button>

          <button
            type="button"
            className="manager-dashboard-button"
            onClick={() =>
              navigate(
                "/sub-admin/dashboard"
              )
            }
          >
            ← DASHBOARD
          </button>

        </div>

      </header>

      <main className="manager-list-container">

        {/* =========================
            SUB ADMIN INFO
        ========================= */}

        <section className="manager-current-admin">

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
            {currentSubAdminId ||
              `DB ID: ${
                currentSubAdminDbId ||
                "-"
              }`}
          </span>

        </section>

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="manager-summary">

          <div className="manager-summary-card">

            <small>
              TOTAL MANAGERS
            </small>

            <strong>
              {managers.length}
            </strong>

          </div>

          <div className="manager-summary-card active-summary">

            <small>
              ACTIVE
            </small>

            <strong>
              {
                managers.filter(
                  (manager) =>
                    manager.status ===
                      "ACTIVE" ||
                    manager.active ===
                      true
                ).length
              }
            </strong>

          </div>

          <div className="manager-summary-card inactive-summary">

            <small>
              INACTIVE
            </small>

            <strong>
              {
                managers.filter(
                  (manager) =>
                    manager.status ===
                      "INACTIVE" ||
                    manager.active ===
                      false
                ).length
              }
            </strong>

          </div>

        </section>

        {/* =========================
            MESSAGES
        ========================= */}

        {error && (
          <div className="manager-form-error">
            {error}
          </div>
        )}

        {message && (
          <div className="manager-form-success">
            ✓ {message}
          </div>
        )}

        {/* =========================
            SEARCH
        ========================= */}

        <section className="manager-search-section">

          <div>

            <h2>
              Managers
            </h2>

            <p>
              Name, Manager ID, Mobile किंवा
              Email ने search करा.
            </p>

          </div>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search manager..."
          />

        </section>

        {/* =========================
            TABLE
        ========================= */}

        <section className="manager-table-card">

          {loading ? (

            <div className="manager-empty-state">

              <div>
                ⌛
              </div>

              <h3>
                Managers Loading...
              </h3>

            </div>

          ) : filteredManagers.length ===
            0 ? (

            <div className="manager-empty-state">

              <div>
                👥
              </div>

              <h3>
                Manager सापडला नाही
              </h3>

              <p>
                नवीन Manager तयार करण्यासाठी
                Add Manager वापरा.
              </p>

            </div>

          ) : (

            <div className="manager-table-wrapper">

              <table className="manager-data-table">

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
                      MOBILE
                    </th>

                    <th>
                      EMAIL
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredManagers.map(
                    (
                      manager,
                      index
                    ) => (

                      <tr key={manager.id}>

                        {/* SR */}

                        <td>
                          {index + 1}
                        </td>

                        {/* MANAGER */}

                        <td>

                          <div className="manager-name-cell">

                            <div className="manager-avatar">

                              {manager
                                .managerName
                                ?.charAt(0)
                                .toUpperCase()}

                            </div>

                            <strong>
                              {
                                manager.managerName
                              }
                            </strong>

                          </div>

                        </td>

                        {/* MANAGER ID */}

                        <td>

                          <span className="manager-id-badge">
                            {manager.managerId}
                          </span>

                        </td>

                        {/* MOBILE */}

                        <td>
                          {manager.mobile}
                        </td>

                        {/* EMAIL */}

                        <td>
                          {manager.email}
                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="manager-action-buttons">

                            <button
                              type="button"
                              className="manager-edit-button"
                              onClick={() =>
                                openEdit(
                                  manager
                                )
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="manager-delete-button"
                              onClick={() =>
                                handleDelete(
                                  manager.id
                                )
                              }
                            >
                              DELETE
                            </button>

                          </div>

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

      {/* =========================
          EDIT MODAL
      ========================= */}

      {editingManager && (

        <div className="manager-modal-overlay">

          <div className="manager-edit-modal">

            <div className="manager-modal-header">

              <div>

                <small>
                  EDIT MANAGER
                </small>

                <h2>
                  {
                    editingManager.managerName
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingManager(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleEditSave
              }
            >

              {/* =====================
                  NAME
              ===================== */}

              <div className="manager-edit-field">

                <label>
                  MANAGER NAME
                </label>

                <input
                  type="text"
                  value={
                    editingManager
                      .managerName
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,

                      managerName:
                        event.target
                          .value,
                    })
                  }
                  required
                />

              </div>

              {/* =====================
                  MANAGER ID
              ===================== */}

              <div className="manager-edit-field">

                <label>
                  MANAGER ID
                </label>

                <input
                  type="text"
                  value={
                    editingManager
                      .managerId
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,

                      managerId:
                        event.target
                          .value,
                    })
                  }
                  required
                />

              </div>

              {/* =====================
                  MOBILE
              ===================== */}

              <div className="manager-edit-field">

                <label>
                  MOBILE
                </label>

                <input
                  type="text"
                  maxLength="10"
                  value={
                    editingManager
                      .mobile
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,

                      mobile:
                        event.target
                          .value,
                    })
                  }
                  required
                />

              </div>

              {/* =====================
                  EMAIL
              ===================== */}

              <div className="manager-edit-field">

                <label>
                  EMAIL
                </label>

                <input
                  type="email"
                  value={
                    editingManager
                      .email
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,

                      email:
                        event.target
                          .value,
                    })
                  }
                  required
                />

              </div>

              {/* =====================
                  ACTIONS
              ===================== */}

              <div className="manager-modal-actions">

                <button
                  type="button"
                  className="manager-cancel-edit"
                  onClick={() =>
                    setEditingManager(
                      null
                    )
                  }
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="manager-save-edit"
                  disabled={saving}
                >
                  {saving
                    ? "SAVING..."
                    : "SAVE CHANGES"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default ManagerList;