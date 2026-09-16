import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";
import "../../styles/tables.css";

function RegisterPhoto() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [date, setDate] = useState(today);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // =====================================
  // LOAD ALL REGISTER RECORDS
  // =====================================

  const [records, setRecords] = useState(() => {
    const saved =
      localStorage.getItem(
        "registerPhotoRecords"
      );

    if (saved) {
      return JSON.parse(saved);
    }

    return [];
  });

  // =====================================
  // ONLY LOGGED-IN MANAGER'S RECORDS
  // =====================================

  const myRecords = records.filter(
    (record) =>
      record.managerId === user?.managerId
  );

  // =====================================
  // SELECT PHOTO
  // =====================================

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(
        "कृपया फक्त फोटो निवडा."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPhoto(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setMessage("");
  };

  // =====================================
  // REMOVE PHOTO
  // =====================================

  const removePhoto = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPhoto(null);
    setPreview(null);

    if (cameraRef.current) {
      cameraRef.current.value = "";
    }

    if (galleryRef.current) {
      galleryRef.current.value = "";
    }
  };

  // =====================================
  // UPLOAD REGISTER PHOTO
  // =====================================

  const handleUpload = (event) => {
    event.preventDefault();

    // Logged-in Manager check
    if (
      !user ||
      user.role !== "MANAGER" ||
      !user.managerId
    ) {
      setMessage(
        "Manager login माहिती मिळाली नाही. कृपया पुन्हा login करा."
      );
      return;
    }

    if (!user.subAdminId) {
      setMessage(
        "Manager चा Sub Admin मिळाला नाही. कृपया पुन्हा login करा."
      );
      return;
    }

    if (!date) {
      setMessage(
        "कृपया तारीख निवडा."
      );
      return;
    }

    if (!photo) {
      setMessage(
        "कृपया Register Photo निवडा."
      );
      return;
    }

    // =====================================
    // FRONTEND TEST RECORD
    // =====================================

    const newRecord = {
      id: Date.now(),

      date,

      // Logged-in Manager
      managerId: user.managerId,

      // Manager belongs to Sub Admin
      subAdminId: user.subAdminId,

      status: "UPLOADED",

      createdAt:
        new Date().toISOString(),
    };

    const updatedRecords = [
      newRecord,
      ...records,
    ];

    setRecords(updatedRecords);

    localStorage.setItem(
      "registerPhotoRecords",
      JSON.stringify(updatedRecords)
    );

    setMessage(
      "Register Photo यशस्वीरीत्या Upload झाला."
    );

    removePhoto();

    /*
      ===================================
      SPRING BOOT + CLOUDFLARE R2 नंतर
      ===================================

      const formData = new FormData();

      formData.append("date", date);
      formData.append("photo", photo);

      await managerApi.uploadRegisterPhoto(
        formData
      );

      Production मध्ये managerId आणि
      subAdminId frontend वरून trust करायचे नाहीत.

      Backend JWT मधून logged-in Manager
      शोधून IDs automatically ठरवेल.
    */
  };

  // =====================================
  // DELETE
  // =====================================

  const handleDelete = (id) => {
    const selectedRecord = records.find(
      (record) => record.id === id
    );

    // Manager can delete only own record
    if (
      !selectedRecord ||
      selectedRecord.managerId !==
        user?.managerId
    ) {
      window.alert(
        "या Register record वर तुम्हाला access नाही."
      );
      return;
    }

    const confirmDelete =
      window.confirm(
        "हा Register Photo record delete करायचा आहे का?"
      );

    if (!confirmDelete) return;

    const updatedRecords =
      records.filter(
        (record) => record.id !== id
      );

    setRecords(updatedRecords);

    localStorage.setItem(
      "registerPhotoRecords",
      JSON.stringify(updatedRecords)
    );
  };

  // =====================================
  // VIEW PHOTO
  // =====================================

  const handleViewPhoto = (record) => {
    if (
      record.managerId !==
      user?.managerId
    ) {
      window.alert(
        "या Register Photo वर तुम्हाला access नाही."
      );
      return;
    }

    window.alert(
      "Backend/R2 जोडल्यानंतर actual photo येथे उघडेल."
    );
  };

  return (
    <div className="customer-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="customer-header">

        <div>

          <h2>
            Register Photo
          </h2>

          <p>
            Daily Register Photo Upload करा
          </p>

        </div>

        <button
          type="button"
          className="back-dashboard-button"
          onClick={() =>
            navigate(
              "/manager/dashboard"
            )
          }
        >
          ← BACK TO DASHBOARD
        </button>

      </header>

      <main className="customer-container">

        {/* =========================
            LOGGED-IN MANAGER
        ========================= */}

        <section className="register-manager-info">

          <div>

            <small>
              LOGGED IN MANAGER
            </small>

            <strong>
              {user?.name || "Manager"}
            </strong>

          </div>

          <div className="register-manager-badges">

            <span>
              {user?.managerId || "-"}
            </span>

            <span>
              {user?.subAdminId || "-"}
            </span>

          </div>

        </section>

        {/* =========================
            UPLOAD PANEL
        ========================= */}

        <section className="customer-panel">

          <div className="panel-title">

            <div className="step-number">
              1
            </div>

            <div>

              <h2>
                Register Photo Upload
              </h2>

              <p>
                तारीख निवडा आणि Register चा
                स्पष्ट फोटो Upload करा.
              </p>

            </div>

          </div>

          <form onSubmit={handleUpload}>

            {/* DATE */}

            <div className="customer-form-group">

              <label>
                तारीख
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="section-divider" />

            {/* PHOTO */}

            <div className="photo-section-title">

              <span className="step-number">
                2
              </span>

              <h3>
                Register Photo
              </h3>

            </div>

            <div className="register-upload-wrapper">

              <div className="register-upload-card">

                <div className="photo-card-heading">

                  <h3>
                    Register Photo
                  </h3>

                  <span
                    className={
                      photo
                        ? "photo-status selected"
                        : "photo-status"
                    }
                  >
                    {photo
                      ? "SELECTED"
                      : "PENDING"}
                  </span>

                </div>

                {/* PREVIEW */}

                {preview ? (

                  <div className="register-photo-preview">

                    <img
                      src={preview}
                      alt="Register Preview"
                    />

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={removePhoto}
                    >
                      ×
                    </button>

                  </div>

                ) : (

                  <div className="register-photo-placeholder">

                    <div className="register-camera-icon">
                      📷
                    </div>

                    <h3>
                      Register Photo निवडा
                    </h3>

                    <p>
                      फोटो स्पष्ट आणि पूर्ण
                      Register दिसेल असा असावा.
                    </p>

                  </div>

                )}

                {/* BUTTONS */}

                <div className="photo-buttons">

                  <button
                    type="button"
                    className="camera-button"
                    onClick={() =>
                      cameraRef.current?.click()
                    }
                  >
                    📷 कॅमेरा
                  </button>

                  <button
                    type="button"
                    className="gallery-button"
                    onClick={() =>
                      galleryRef.current?.click()
                    }
                  >
                    🖼️ गॅलरी
                  </button>

                </div>

                {/* MOBILE CAMERA */}

                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={handlePhoto}
                />

                {/* GALLERY */}

                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhoto}
                />

              </div>

            </div>

            {/* MESSAGE */}

            {message && (
              <div className="customer-message">
                {message}
              </div>
            )}

            {/* UPLOAD BUTTON */}

            <button
              type="submit"
              className="upload-customer-button"
            >
              📤 REGISTER PHOTO UPLOAD करा
            </button>

          </form>

        </section>

        {/* =========================
            HISTORY
        ========================= */}

        <section className="records-panel">

          <div className="records-heading">

            <div>

              <h2>
                Register Photo History
              </h2>

              <p>
                या Manager ने आधी Upload केलेले
                Register Photos
              </p>

            </div>

            <div className="record-count">
              {myRecords.length}
            </div>

          </div>

          {myRecords.length === 0 ? (

            <div className="empty-register-records">

              <div>
                📷
              </div>

              <h3>
                अजून Register Photo नाही
              </h3>

              <p>
                पहिला Register Photo Upload करा.
              </p>

            </div>

          ) : (

            <div className="records-table-wrapper">

              <table className="records-table">

                <thead>

                  <tr>
                    <th>SR.</th>
                    <th>DATE</th>
                    <th>PHOTO</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>

                </thead>

                <tbody>

                  {myRecords.map(
                    (record, index) => (

                      <tr key={record.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {record.date}
                        </td>

                        <td>

                          <button
                            className="view-front-button"
                            type="button"
                            onClick={() =>
                              handleViewPhoto(
                                record
                              )
                            }
                          >
                            फोटो पहा
                          </button>

                        </td>

                        <td>

                          <span className="register-uploaded-status">
                            {record.status}
                          </span>

                        </td>

                        <td>

                          <button
                            type="button"
                            className="delete-register-button"
                            onClick={() =>
                              handleDelete(
                                record.id
                              )
                            }
                          >
                            DELETE
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

    </div>
  );
}

export default RegisterPhoto;