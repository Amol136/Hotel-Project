import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/tables.css";

function ManagerList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Logged-in Sub Admin ID
  const currentSubAdminId = user?.subAdminId;

  const [search, setSearch] = useState("");
  const [editingManager, setEditingManager] =
    useState(null);

  const [managers, setManagers] = useState(() => {
    const saved =
      JSON.parse(localStorage.getItem("managers")) || [];

    return saved;
  });

  // Save Managers
  const saveManagers = (updatedManagers) => {
    setManagers(updatedManagers);

    localStorage.setItem(
      "managers",
      JSON.stringify(updatedManagers)
    );
  };

  // =====================================
  // ONLY LOGGED-IN SUB ADMIN'S MANAGERS
  // =====================================

  const myManagers = useMemo(() => {
    if (!currentSubAdminId) {
      return [];
    }

    return managers.filter(
      (manager) =>
        manager.createdBySubAdminId ===
        currentSubAdminId
    );
  }, [managers, currentSubAdminId]);

  // =====================================
  // SEARCH
  // =====================================

  const filteredManagers = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

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

  // =====================================
  // DELETE
  // =====================================

  const handleDelete = (managerId) => {
    const selectedManager = managers.find(
      (manager) => manager.id === managerId
    );

    // Extra frontend safety
    if (
      !selectedManager ||
      selectedManager.createdBySubAdminId !==
        currentSubAdminId
    ) {
      window.alert(
        "या Manager वर तुम्हाला access नाही."
      );
      return;
    }

    const confirmed = window.confirm(
      "हा Manager delete करायचा आहे का?"
    );

    if (!confirmed) return;

    const updatedManagers = managers.filter(
      (manager) => manager.id !== managerId
    );

    saveManagers(updatedManagers);
  };

  
  // =====================================
  // OPEN EDIT
  // =====================================

  const openEdit = (manager) => {
    if (
      manager.createdBySubAdminId !==
      currentSubAdminId
    ) {
      window.alert(
        "या Manager वर तुम्हाला access नाही."
      );
      return;
    }

    setEditingManager({
      ...manager,
    });
  };

  // =====================================
  // EDIT SAVE
  // =====================================

  const handleEditSave = (event) => {
    event.preventDefault();

    if (!editingManager) {
      return;
    }

    if (
      editingManager.createdBySubAdminId !==
      currentSubAdminId
    ) {
      window.alert(
        "या Manager वर तुम्हाला access नाही."
      );

      setEditingManager(null);
      return;
    }

    if (
      !editingManager.managerName?.trim() ||
      !editingManager.managerId?.trim() ||
      !editingManager.mobile?.trim() ||
      !editingManager.email?.trim()
    ) {
      window.alert(
        "कृपया सर्व माहिती भरा."
      );
      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        editingManager.mobile
      )
    ) {
      window.alert(
        "Mobile Number 10 अंकी असावा."
      );
      return;
    }

    // Manager ID duplicate check
    const duplicateManagerId = managers.some(
      (manager) =>
        manager.id !== editingManager.id &&
        manager.managerId?.toLowerCase() ===
          editingManager.managerId
            ?.trim()
            .toLowerCase()
    );

    if (duplicateManagerId) {
      window.alert(
        "हा Manager ID आधीपासून अस्तित्वात आहे."
      );
      return;
    }

    // Email duplicate check
    const duplicateEmail = managers.some(
      (manager) =>
        manager.id !== editingManager.id &&
        manager.email?.toLowerCase() ===
          editingManager.email
            ?.trim()
            .toLowerCase()
    );

    if (duplicateEmail) {
      window.alert(
        "या Email वर Manager आधीपासून अस्तित्वात आहे."
      );
      return;
    }

    const updatedManagers = managers.map(
      (manager) => {
        if (
          manager.id === editingManager.id &&
          manager.createdBySubAdminId ===
            currentSubAdminId
        ) {
          return {
            ...editingManager,

            managerName:
              editingManager.managerName.trim(),

            managerId:
              editingManager.managerId
                .trim()
                .toUpperCase(),

            mobile:
              editingManager.mobile.trim(),

            email:
              editingManager.email
                .trim()
                .toLowerCase(),

            // Mapping change होऊ देऊ नका
            createdBySubAdminId:
              currentSubAdminId,
          };
        }

        return manager;
      }
    );

    saveManagers(updatedManagers);

    setEditingManager(null);
  };

  return (
    <div className="manager-list-page">

      {/* HEADER */}

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

        {/* SUB ADMIN INFO */}

        <section className="manager-current-admin">

          <div>
            <small>
              LOGGED IN SUB ADMIN
            </small>

            <strong>
              {user?.name || "Sub Admin"}
            </strong>
          </div>

          <span>
            {currentSubAdminId || "-"}
          </span>

        </section>

        {/* SUMMARY */}

        <section className="manager-summary">

          <div className="manager-summary-card">

            <small>
              TOTAL MANAGERS
            </small>

            <strong>
              {myManagers.length}
            </strong>

          </div>

          <div className="manager-summary-card active-summary">

            <small>
              ACTIVE
            </small>

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

            <small>
              INACTIVE
            </small>

            <strong>
              {
                myManagers.filter(
                  (manager) =>
                    manager.status ===
                    "INACTIVE"
                ).length
              }
            </strong>

          </div>

        </section>

        {/* SEARCH */}

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
              setSearch(event.target.value)
            }
            placeholder="Search manager..."
          />

        </section>

        {/* TABLE */}

        <section className="manager-table-card">

          {filteredManagers.length === 0 ? (

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
                    <th>SR.</th>
                    <th>MANAGER</th>
                    <th>MANAGER ID</th>
                    <th>MOBILE</th>
                    <th>EMAIL</th>
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

                          <div className="manager-action-buttons">

                            <button
                              type="button"
                              className="manager-edit-button"
                              onClick={() =>
                                openEdit(manager)
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
                  {editingManager.managerName}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingManager(null)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleEditSave}>

              {/* NAME */}

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

              {/* MANAGER ID */}

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

              {/* MOBILE */}

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

              {/* EMAIL */}

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

              {/* ACTIONS */}

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