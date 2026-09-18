import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function SubAdminList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);

  const [subAdmins, setSubAdmins] = useState(() => {
    return JSON.parse(localStorage.getItem("subAdmins")) || [];
  });

  const saveSubAdmins = (updated) => {
    setSubAdmins(updated);

    localStorage.setItem(
      "subAdmins",
      JSON.stringify(updated)
    );
  };

  // =====================================
  // SEARCH
  // =====================================

  const filteredSubAdmins = useMemo(() => {
    const text = search.toLowerCase().trim();

    if (!text) return subAdmins;

    return subAdmins.filter(
      (item) =>
        item.name?.toLowerCase().includes(text) ||
        item.subAdminId?.toLowerCase().includes(text) ||
        item.mobile?.includes(text) ||
        item.email?.toLowerCase().includes(text)
    );
  }, [search, subAdmins]);

  // =====================================
  // ACTIVE / INACTIVE
  // =====================================

  const toggleStatus = (id) => {
    const updated = subAdmins.map((item) =>
      item.id === id
        ? {
            ...item,
            status:
              item.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE",
          }
        : item
    );

    saveSubAdmins(updated);
  };

  // =====================================
  // DELETE
  // =====================================

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "हा Sub Admin delete करायचा आहे का?"
    );

    if (!confirmed) return;

    const updated = subAdmins.filter(
      (item) => item.id !== id
    );

    saveSubAdmins(updated);
  };

  // =====================================
  // EDIT SAVE
  // =====================================

  const handleEditSave = (event) => {
    event.preventDefault();

    const updated = subAdmins.map((item) =>
      item.id === editingSubAdmin.id
        ? editingSubAdmin
        : item
    );

    saveSubAdmins(updated);

    setEditingSubAdmin(null);
  };

  return (
    <div className="main-subadmin-list-page">

      {/* =====================================
          HEADER
      ===================================== */}

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

        {/* =====================================
            SUMMARY
        ===================================== */}

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
              {
                subAdmins.filter(
                  (item) =>
                    item.status === "ACTIVE"
                ).length
              }
            </strong>

          </div>

          <div className="summary-inactive">

            <small>
              INACTIVE
            </small>

            <strong>
              {
                subAdmins.filter(
                  (item) =>
                    item.status === "INACTIVE"
                ).length
              }
            </strong>

          </div>

        </section>

        {/* =====================================
            SEARCH TOOLBAR
        ===================================== */}

        <section className="main-subadmin-toolbar">

          <div>

            <h2>
              Sub Admin Accounts
            </h2>

            <p>
              Name, ID, Mobile किंवा Email ने search करा
            </p>

          </div>

          <input
            type="text"
            placeholder="Search Sub Admin..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </section>

        {/* =====================================
            TABLE
        ===================================== */}

        <section className="main-subadmin-table-card">

          {filteredSubAdmins.length === 0 ? (

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

                    <th>SR.</th>

                    <th>SUB ADMIN</th>

                    <th>SUB ADMIN ID</th>

                    <th>MOBILE</th>

                    <th>EMAIL</th>

                    <th>STATUS</th>

                    <th>ACTION</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredSubAdmins.map(
                    (item, index) => (

                      <tr key={item.id}>

                        {/* SR */}

                        <td>
                          {index + 1}
                        </td>

                        {/* SUB ADMIN */}

                        <td>

                          <div className="main-subadmin-name">

                            <div className="main-subadmin-avatar">

                              {item.name
                                ?.charAt(0)
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
                            {item.subAdminId}
                          </span>

                        </td>

                        {/* MOBILE */}

                        <td>
                          {item.mobile}
                        </td>

                        {/* EMAIL */}

                        <td>
                          {item.email}
                        </td>

                        {/* STATUS */}

                        <td>

                          <button
                            className={
                              item.status === "ACTIVE"
                                ? "main-subadmin-status active"
                                : "main-subadmin-status inactive"
                            }
                            onClick={() =>
                              toggleStatus(item.id)
                            }
                          >
                            {item.status}
                          </button>

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="main-subadmin-actions">

                            <button
                              className="main-subadmin-edit"
                              onClick={() =>
                                setEditingSubAdmin({
                                  ...item,
                                })
                              }
                            >
                              EDIT
                            </button>

                            <button
                              className="main-subadmin-delete"
                              onClick={() =>
                                handleDelete(item.id)
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

      {/* =====================================
          EDIT MODAL
      ===================================== */}

      {editingSubAdmin && (

        <div className="main-subadmin-modal-overlay">

          <div className="main-subadmin-modal">

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
                onClick={() =>
                  setEditingSubAdmin(null)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleEditSave}>

              {/* NAME */}

              <div className="main-subadmin-edit-field">

                <label>
                  SUB ADMIN NAME
                </label>

                <input
                  type="text"
                  required
                  value={editingSubAdmin.name}
                  onChange={(e) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,
                      name: e.target.value,
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
                  onChange={(e) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,
                      subAdminId:
                        e.target.value,
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
                  value={editingSubAdmin.mobile}
                  onChange={(e) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,
                      mobile: e.target.value,
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
                  value={editingSubAdmin.email}
                  onChange={(e) =>
                    setEditingSubAdmin({
                      ...editingSubAdmin,
                      email: e.target.value,
                    })
                  }
                />

              </div>

              {/* ACTIONS */}

              <div className="main-subadmin-modal-actions">

                <button
                  type="button"
                  className="main-subadmin-cancel"
                  onClick={() =>
                    setEditingSubAdmin(null)
                  }
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="main-subadmin-save"
                >
                  SAVE CHANGES
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