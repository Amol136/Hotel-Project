import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/tables.css";

function SubAdminList() {
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
    editingSubAdmin,
    setEditingSubAdmin,
  ] = useState(null);

  const [subAdmins, setSubAdmins] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  // =====================================
  // LOAD SUB ADMINS
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

    const fetchSubAdmins =
      async () => {
        try {
          const response =
            await apiFetch(
              "/api/users/sub-admins"
            );

          if (!response.ok) {
            const errorMessage =
              await response.text();

            throw new Error(
              errorMessage ||
                "Sub Admin list load करता आली नाही."
            );
          }

          const data =
            await response.json();

          if (cancelled) {
            return;
          }

          setSubAdmins(
            Array.isArray(data)
              ? data
              : []
          );

          setError("");
        } catch (err) {
          console.error(
            "Load Sub Admin Error:",
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
                  "Sub Admin list load करता आली नाही."
              );
            }
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchSubAdmins();

    return () => {
      cancelled = true;
    };
  }, [
    mainAdminId,
    user?.role,
  ]);

  // =====================================
  // SEARCH
  // =====================================

  const filteredSubAdmins =
    useMemo(() => {
      const text =
        search
          .toLowerCase()
          .trim();

      if (!text) {
        return subAdmins;
      }

      return subAdmins.filter(
        (item) => {
          const name =
            String(
              item.name || ""
            ).toLowerCase();

          const subAdminId =
            String(
              item.subAdminId ||
                item.userId ||
                ""
            ).toLowerCase();

          const mobile =
            String(
              item.mobile || ""
            ).toLowerCase();

          const email =
            String(
              item.email || ""
            ).toLowerCase();

          return (
            name.includes(text) ||
            subAdminId.includes(text) ||
            mobile.includes(text) ||
            email.includes(text)
          );
        }
      );
    }, [
      search,
      subAdmins,
    ]);

  // =====================================
  // DELETE SUB ADMIN
  // =====================================

  const handleDelete =
    async (id) => {
      const confirmed =
        window.confirm(
          "हा Sub Admin delete करायचा आहे का?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        const response =
          await apiFetch(
            `/api/users/sub-admins/${id}`,
            {
              method: "DELETE",
            }
          );

        if (!response.ok) {
          const errorMessage =
            await response.text();

          throw new Error(
            errorMessage ||
              "Sub Admin delete करता आला नाही."
          );
        }

        setSubAdmins((prev) =>
          prev.filter(
            (item) =>
              item.id !== id
          )
        );

        setMessage(
          "Sub Admin यशस्वीरीत्या delete झाला."
        );
      } catch (err) {
        console.error(
          "Delete Sub Admin Error:",
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
              "Sub Admin delete करता आला नाही."
          );
        }
      }
    };

  // =====================================
  // EDIT / UPDATE SUB ADMIN
  // =====================================

  const handleEditSave =
    async (event) => {
      event.preventDefault();

      if (!editingSubAdmin) {
        return;
      }

      // =================================
      // VALIDATION
      // =================================

      if (
        !editingSubAdmin.name?.trim() ||
        !editingSubAdmin.subAdminId?.trim() ||
        !editingSubAdmin.mobile?.trim() ||
        !editingSubAdmin.email?.trim()
      ) {
        setError(
          "कृपया सर्व माहिती भरा."
        );

        return;
      }

      if (
        !/^[0-9]{10}$/.test(
          editingSubAdmin.mobile
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

        const response =
          await apiFetch(
            `/api/users/sub-admins/${editingSubAdmin.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                name:
                  editingSubAdmin.name.trim(),

                subAdminId:
                  editingSubAdmin.subAdminId
                    .trim()
                    .toUpperCase(),

                mobile:
                  editingSubAdmin.mobile.trim(),

                email:
                  editingSubAdmin.email
                    .trim()
                    .toLowerCase(),

                // Existing password change
                // करायचा नाही.
                password: "",
              }),
            }
          );

        if (!response.ok) {
          const errorMessage =
            await response.text();

          throw new Error(
            errorMessage ||
              "Sub Admin update करता आला नाही."
          );
        }

        const updatedSubAdmin =
          await response.json();

        setSubAdmins((prev) =>
          prev.map((item) =>
            item.id ===
            updatedSubAdmin.id
              ? updatedSubAdmin
              : item
          )
        );

        setEditingSubAdmin(null);

        setMessage(
          "Sub Admin यशस्वीरीत्या update झाला."
        );
      } catch (err) {
        console.error(
          "Update Sub Admin Error:",
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
              "Sub Admin update करता आला नाही."
          );
        }
      } finally {
        setSaving(false);
      }
    };

  // =====================================
  // SUMMARY
  // =====================================

  const activeCount =
    subAdmins.filter(
      (item) =>
        item.status ===
        "ACTIVE"
    ).length;

  const inactiveCount =
    subAdmins.filter(
      (item) =>
        item.status ===
        "INACTIVE"
    ).length;

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="main-subadmin-list-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="main-subadmin-list-header">

        <div>

          <span>
            MAIN ADMIN / USER MANAGEMENT
          </span>

          <h1>
            Sub Admin List
          </h1>

          <p>
            सर्व Sub Admin accounts manage करा
          </p>

        </div>

        <div className="main-subadmin-header-actions">

          <button
            type="button"
            className="main-add-subadmin"
            onClick={() =>
              navigate(
                "/main-admin/create-sub-admin"
              )
            }
          >
            + ADD SUB ADMIN
          </button>

          <button
            type="button"
            className="main-back-dashboard"
            onClick={() =>
              navigate(
                "/main-admin/dashboard"
              )
            }
          >
            ← DASHBOARD
          </button>

        </div>

      </header>

      <main className="main-subadmin-list-container">

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="main-subadmin-summary">

          <div>

            <small>
              TOTAL SUB ADMINS
            </small>

            <strong>
              {subAdmins.length}
            </strong>

          </div>

          <div className="summary-active">

            <small>
              ACTIVE
            </small>

            <strong>
              {activeCount}
            </strong>

          </div>

          <div className="summary-inactive">

            <small>
              INACTIVE
            </small>

            <strong>
              {inactiveCount}
            </strong>

          </div>

        </section>

        {/* =========================
            MESSAGES
        ========================= */}

        {error && (
          <div className="subadmin-form-error">
            {error}
          </div>
        )}

        {message && (
          <div className="subadmin-form-success">
            ✓ {message}
          </div>
        )}

        {/* =========================
            SEARCH
        ========================= */}

        <section className="main-subadmin-toolbar">

          <div>

            <h2>
              Sub Admin Accounts
            </h2>

            <p>
              Name, ID, Mobile किंवा Email ने
              search करा
            </p>

          </div>

          <input
            type="text"
            placeholder="Search Sub Admin..."
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

        <section className="main-subadmin-table-card">

          {loading ? (

            <div className="main-subadmin-empty">

              <h3>
                Loading Sub Admins...
              </h3>

            </div>

          ) : filteredSubAdmins.length ===
            0 ? (

            <div className="main-subadmin-empty">

              <div>
                🏢
              </div>

              <h3>
                Sub Admin सापडला नाही
              </h3>

              <p>
                नवीन Sub Admin तयार करण्यासाठी
                Add Sub Admin वापरा.
              </p>

            </div>

          ) : (

            <div className="main-subadmin-table-wrapper">

              <table className="main-subadmin-table">

                <thead>

                  <tr>

                    <th>
                      SR.
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
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredSubAdmins.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                      >

                        {/* SR */}

                        <td>
                          {index + 1}
                        </td>

                        {/* SUB ADMIN */}

                        <td>

                          <div className="main-subadmin-name">

                            <div className="main-subadmin-avatar">

                              {(item.name ||
                                "S")
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <strong>
                              {item.name}
                            </strong>

                          </div>

                        </td>

                        {/* SUB ADMIN ID */}

                        <td>

                          <span className="main-subadmin-id">

                            {item.subAdminId ||
                              item.userId ||
                              "-"}

                          </span>

                        </td>

                        {/* MOBILE */}

                        <td>
                          {item.mobile ||
                            "-"}
                        </td>

                        {/* EMAIL */}

                        <td>
                          {item.email ||
                            "-"}
                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="main-subadmin-actions">

                            <button
                              type="button"
                              className="main-subadmin-edit"
                              onClick={() => {
                                setError("");
                                setMessage("");

                                setEditingSubAdmin({
                                  ...item,

                                  subAdminId:
                                    item.subAdminId ||
                                    item.userId ||
                                    "",
                                });
                              }}
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="main-subadmin-delete"
                              onClick={() =>
                                handleDelete(
                                  item.id
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

      {editingSubAdmin && (

        <div className="main-subadmin-modal-overlay">

          <div className="main-subadmin-modal">

            {/* =====================
                MODAL HEADER
            ===================== */}

            <div className="main-subadmin-modal-header">

              <div>

                <small>
                  EDIT SUB ADMIN
                </small>

                <h2>
                  {editingSubAdmin.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingSubAdmin(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            {/* =====================
                EDIT FORM
            ===================== */}

            <form
              onSubmit={
                handleEditSave
              }
            >

              {/* NAME */}

              <div className="main-subadmin-edit-field">

                <label>
                  SUB ADMIN NAME
                </label>

                <input
                  type="text"
                  required
                  value={
                    editingSubAdmin.name
                  }
                  onChange={(event) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,

                      name:
                        event.target.value,
                    })
                  }
                />

              </div>

              {/* SUB ADMIN ID */}

              <div className="main-subadmin-edit-field">

                <label>
                  SUB ADMIN ID
                </label>

                <input
                  type="text"
                  required
                  value={
                    editingSubAdmin.subAdminId
                  }
                  onChange={(event) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,

                      subAdminId:
                        event.target.value,
                    })
                  }
                />

              </div>

              {/* MOBILE */}

              <div className="main-subadmin-edit-field">

                <label>
                  MOBILE
                </label>

                <input
                  type="text"
                  maxLength="10"
                  required
                  value={
                    editingSubAdmin.mobile
                  }
                  onChange={(event) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,

                      mobile:
                        event.target.value,
                    })
                  }
                />

              </div>

              {/* EMAIL */}

              <div className="main-subadmin-edit-field">

                <label>
                  EMAIL
                </label>

                <input
                  type="email"
                  required
                  value={
                    editingSubAdmin.email
                  }
                  onChange={(event) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,

                      email:
                        event.target.value,
                    })
                  }
                />

              </div>

              {/* =====================
                  MODAL BUTTONS
              ===================== */}

              <div className="main-subadmin-modal-actions">

                <button
                  type="button"
                  className="main-subadmin-cancel"
                  onClick={() =>
                    setEditingSubAdmin(
                      null
                    )
                  }
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="main-subadmin-save"
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

export default SubAdminList;