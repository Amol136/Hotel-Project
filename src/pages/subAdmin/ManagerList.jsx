import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";

function ManagerList() {
  const navigate = useNavigate();

  // Temporary logged-in Sub Admin
  // Backend आल्यावर JWT मधून मिळेल.
  const currentSubAdminId = "SUBADMIN-001";

  const [search, setSearch] = useState("");
  const [editingManager, setEditingManager] = useState(null);

  const [managers, setManagers] = useState(() => {
    const saved =
      JSON.parse(localStorage.getItem("managers")) || [];

    return saved;
  });

  const saveManagers = (updatedManagers) => {
    setManagers(updatedManagers);

    localStorage.setItem(
      "managers",
      JSON.stringify(updatedManagers)
    );
  };

  // फक्त या Sub Admin चे Managers
  const myManagers = useMemo(() => {
    return managers.filter(
      (manager) =>
        manager.createdBySubAdminId === currentSubAdminId
    );
  }, [managers]);

  // SEARCH
  const filteredManagers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return myManagers;
    }

    return myManagers.filter((manager) => {
      return (
        manager.managerName
          ?.toLowerCase()
          .includes(searchText) ||
        manager.managerId
          ?.toLowerCase()
          .includes(searchText) ||
        manager.mobile
          ?.toLowerCase()
          .includes(searchText) ||
        manager.email
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [search, myManagers]);

  // DELETE
  const handleDelete = (managerId) => {
    const confirmed = window.confirm(
      "हा Manager delete करायचा आहे का?"
    );

    if (!confirmed) return;

    const updatedManagers = managers.filter(
      (manager) => manager.id !== managerId
    );

    saveManagers(updatedManagers);
  };

  // ACTIVE / INACTIVE
  const toggleStatus = (managerId) => {
    const updatedManagers = managers.map((manager) => {
      if (manager.id === managerId) {
        return {
          ...manager,
          status:
            manager.status === "ACTIVE"
              ? "INACTIVE"
              : "ACTIVE",
        };
      }

      return manager;
    });

    saveManagers(updatedManagers);
  };

  // EDIT SAVE
  const handleEditSave = (event) => {
    event.preventDefault();

    const updatedManagers = managers.map((manager) => {
      if (manager.id === editingManager.id) {
        return editingManager;
      }

      return manager;
    });

    saveManagers(updatedManagers);

    setEditingManager(null);
  };

  return (
    <div className="manager-list-page">

      {/* HEADER */}

      <header className="manager-list-header">

        <div>
          <span>SUB ADMIN</span>
          <h1>Manager List</h1>

          <p>
            तुम्ही तयार केलेले Managers manage करा
          </p>
        </div>

        <div className="manager-header-actions">

          <button
            className="manager-add-button"
            onClick={() =>
              navigate("/sub-admin/create-manager")
            }
          >
            + ADD MANAGER
          </button>

          <button
            className="manager-dashboard-button"
            onClick={() =>
              navigate("/sub-admin/dashboard")
            }
          >
            ← DASHBOARD
          </button>

        </div>

      </header>

      <main className="manager-list-container">

        {/* SUMMARY */}

        <section className="manager-summary">

          <div className="manager-summary-card">
            <small>TOTAL MANAGERS</small>

            <strong>
              {myManagers.length}
            </strong>
          </div>

          <div className="manager-summary-card active-summary">
            <small>ACTIVE</small>

            <strong>
              {
                myManagers.filter(
                  (manager) =>
                    manager.status === "ACTIVE"
                ).length
              }
            </strong>
          </div>

          <div className="manager-summary-card inactive-summary">
            <small>INACTIVE</small>

            <strong>
              {
                myManagers.filter(
                  (manager) =>
                    manager.status === "INACTIVE"
                ).length
              }
            </strong>
          </div>

        </section>

        {/* SEARCH */}

        <section className="manager-search-section">

          <div>
            <h2>Managers</h2>

            <p>
              Name, Manager ID, Mobile किंवा Email ने
              search करा.
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search manager..."
          />

        </section>

        {/* TABLE */}

        <section className="manager-table-card">

          {filteredManagers.length === 0 ? (

            <div className="manager-empty-state">

              <div>👥</div>

              <h3>
                Manager सापडला नाही
              </h3>

              <p>
                नवीन Manager तयार करण्यासाठी Add
                Manager वापरा.
              </p>

            </div>

          ) : (

            <div className="manager-table-wrapper">

              <table className="manager-data-table">

                <thead>
                  <tr>
                    <th>SR.</th>
                    <th>MANAGER</th>
                    <th>MANAGER ID</th>
                    <th>MOBILE</th>
                    <th>EMAIL</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredManagers.map(
                    (manager, index) => (

                      <tr key={manager.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="manager-name-cell">

                            <div className="manager-avatar">
                              {manager.managerName
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {manager.managerName}
                            </strong>

                          </div>

                        </td>

                        <td>
                          <span className="manager-id-badge">
                            {manager.managerId}
                          </span>
                        </td>

                        <td>
                          {manager.mobile}
                        </td>

                        <td>
                          {manager.email}
                        </td>

                        <td>

                          <button
                            type="button"
                            className={
                              manager.status === "ACTIVE"
                                ? "manager-status active"
                                : "manager-status inactive"
                            }
                            onClick={() =>
                              toggleStatus(manager.id)
                            }
                          >
                            {manager.status}
                          </button>

                        </td>

                        <td>

                          <div className="manager-action-buttons">

                            <button
                              className="manager-edit-button"
                              onClick={() =>
                                setEditingManager({
                                  ...manager,
                                })
                              }
                            >
                              EDIT
                            </button>

                            <button
                              className="manager-delete-button"
                              onClick={() =>
                                handleDelete(manager.id)
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

      {/* EDIT MODAL */}

      {editingManager && (

        <div className="manager-modal-overlay">

          <div className="manager-edit-modal">

            <div className="manager-modal-header">

              <div>
                <small>
                  EDIT MANAGER
                </small>

                <h2>
                  {editingManager.managerName}
                </h2>
              </div>

              <button
                onClick={() =>
                  setEditingManager(null)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleEditSave}>

              <div className="manager-edit-field">

                <label>
                  MANAGER NAME
                </label>

                <input
                  type="text"
                  value={
                    editingManager.managerName
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,
                      managerName:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="manager-edit-field">

                <label>
                  MANAGER ID
                </label>

                <input
                  type="text"
                  value={
                    editingManager.managerId
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,
                      managerId:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="manager-edit-field">

                <label>
                  MOBILE
                </label>

                <input
                  type="text"
                  maxLength="10"
                  value={
                    editingManager.mobile
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,
                      mobile:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="manager-edit-field">

                <label>
                  EMAIL
                </label>

                <input
                  type="email"
                  value={
                    editingManager.email
                  }
                  onChange={(event) =>
                    setEditingManager({
                      ...editingManager,
                      email:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="manager-modal-actions">

                <button
                  type="button"
                  className="manager-cancel-edit"
                  onClick={() =>
                    setEditingManager(null)
                  }
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="manager-save-edit"
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

export default ManagerList;