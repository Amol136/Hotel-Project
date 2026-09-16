import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/forms.css";
import "../../styles/tables.css";

function CustomerId() {
  const navigate = useNavigate();

  const frontCameraRef = useRef(null);
  const frontGalleryRef = useRef(null);
  const backCameraRef = useRef(null);
  const backGalleryRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);

  const [frontPhoto, setFrontPhoto] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);

  const [backPhoto, setBackPhoto] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [message, setMessage] = useState("");

  // Temporary dummy records
 const [records, setRecords] = useState(() => {
  const savedRecords = localStorage.getItem("customerRecords");

  if (savedRecords) {
    return JSON.parse(savedRecords);
  }

  const initialRecords = [
    {
      id: 1,
      date: "2026-09-15",
      status: "VERIFIED",
    },
    {
      id: 2,
      date: "2026-09-14",
      status: "PENDING",
    },
  ];

  localStorage.setItem(
    "customerRecords",
    JSON.stringify(initialRecords)
  );

  return initialRecords;
});
  const handlePhoto = (event, side) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("कृपया फक्त फोटो निवडा.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (side === "front") {
      if (frontPreview) {
        URL.revokeObjectURL(frontPreview);
      }

      setFrontPhoto(file);
      setFrontPreview(previewUrl);
    }

    if (side === "back") {
      if (backPreview) {
        URL.revokeObjectURL(backPreview);
      }

      setBackPhoto(file);
      setBackPreview(previewUrl);
    }

    setMessage("");
  };

  const removeFrontPhoto = () => {
    if (frontPreview) {
      URL.revokeObjectURL(frontPreview);
    }

    setFrontPhoto(null);
    setFrontPreview(null);
  };

  const removeBackPhoto = () => {
    if (backPreview) {
      URL.revokeObjectURL(backPreview);
    }

    setBackPhoto(null);
    setBackPreview(null);
  };

  const handleUpload = (event) => {
    event.preventDefault();

    if (!date) {
      setMessage("कृपया तारीख निवडा.");
      return;
    }

    if (!frontPhoto) {
      setMessage("कृपया ID ची समोरील बाजू निवडा.");
      return;
    }

    if (!backPhoto) {
      setMessage("कृपया ID ची मागील बाजू निवडा.");
      return;
    }

    // Temporary frontend-only record
    const newRecord = {
      id: Date.now(),
      date,
      status: "PENDING",
    };

    const updatedRecords = [
  newRecord,
  ...records,
];

setRecords(updatedRecords);

localStorage.setItem(
  "customerRecords",
  JSON.stringify(updatedRecords)
);

    setMessage("Customer ID फोटो यशस्वीरीत्या जोडले.");

    removeFrontPhoto();
    removeBackPhoto();

    /*
      BACKEND आल्यावर इथे:

      const formData = new FormData();

      formData.append("date", date);
      formData.append("frontPhoto", frontPhoto);
      formData.append("backPhoto", backPhoto);

      await managerApi.uploadCustomerId(formData);
    */
  };

  return (
    <div className="customer-page">

      {/* HEADER */}

      <header className="customer-header">
        <div>
          <h2>Customer ID Management</h2>
          <p>ग्राहकाचे ID फोटो Upload, Verify आणि Edit करा</p>
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/manager/dashboard")}
        >
          ← BACK TO DASHBOARD
        </button>
      </header>

      <main className="customer-container">

        {/* UPLOAD SECTION */}

        <section className="customer-panel">

          <div className="panel-title">
            <div className="step-number">1</div>

            <div>
              <h2>ग्राहक ID फोटो अपलोड करा</h2>
              <p>
                समोरील आणि मागील बाजूचे स्पष्ट फोटो निवडा.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload}>

            {/* DATE */}

            <div className="customer-form-group">
              <label>तारीख</label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />
            </div>

            <div className="section-divider" />

            {/* PHOTOS */}

            <div className="photo-section-title">
              <span className="step-number">2</span>
              <h3>फोटो अपलोड</h3>
            </div>

            <div className="photo-upload-grid">

              {/* FRONT */}

              <div className="photo-upload-card">

                <div className="photo-card-heading">
                  <h3>समोरील बाजू</h3>

                  <span
                    className={
                      frontPhoto
                        ? "photo-status selected"
                        : "photo-status"
                    }
                  >
                    {frontPhoto ? "SELECTED" : "PENDING"}
                  </span>
                </div>

                {frontPreview ? (
                  <div className="photo-preview">
                    <img
                      src={frontPreview}
                      alt="Front ID Preview"
                    />

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={removeFrontPhoto}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <div className="placeholder-icon">🪪</div>
                    <p>समोरील बाजूचा फोटो निवडा</p>
                  </div>
                )}

                <div className="photo-buttons">

                  <button
                    type="button"
                    className="camera-button"
                    onClick={() =>
                      frontCameraRef.current?.click()
                    }
                  >
                    📷 कॅमेरा
                  </button>

                  <button
                    type="button"
                    className="gallery-button"
                    onClick={() =>
                      frontGalleryRef.current?.click()
                    }
                  >
                    🖼️ गॅलरी
                  </button>

                </div>

                {/* Mobile camera */}

                <input
                  ref={frontCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(event) =>
                    handlePhoto(event, "front")
                  }
                />

                {/* Gallery */}

                <input
                  ref={frontGalleryRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) =>
                    handlePhoto(event, "front")
                  }
                />

              </div>

              {/* BACK */}

              <div className="photo-upload-card">

                <div className="photo-card-heading">
                  <h3>मागील बाजू</h3>

                  <span
                    className={
                      backPhoto
                        ? "photo-status selected"
                        : "photo-status"
                    }
                  >
                    {backPhoto ? "SELECTED" : "PENDING"}
                  </span>
                </div>

                {backPreview ? (
                  <div className="photo-preview">
                    <img
                      src={backPreview}
                      alt="Back ID Preview"
                    />

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={removeBackPhoto}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <div className="placeholder-icon">🪪</div>
                    <p>मागील बाजूचा फोटो निवडा</p>
                  </div>
                )}

                <div className="photo-buttons">

                  <button
                    type="button"
                    className="camera-button"
                    onClick={() =>
                      backCameraRef.current?.click()
                    }
                  >
                    📷 कॅमेरा
                  </button>

                  <button
                    type="button"
                    className="gallery-button"
                    onClick={() =>
                      backGalleryRef.current?.click()
                    }
                  >
                    🖼️ गॅलरी
                  </button>

                </div>

                <input
                  ref={backCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(event) =>
                    handlePhoto(event, "back")
                  }
                />

                <input
                  ref={backGalleryRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) =>
                    handlePhoto(event, "back")
                  }
                />

              </div>

            </div>

            {message && (
              <div className="customer-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="upload-customer-button"
            >
              फोटो UPLOAD करा
            </button>

          </form>

        </section>

        {/* PREVIOUS RECORDS */}

        <section className="records-panel">

          <div className="records-heading">
            <div>
              <h2>ग्राहक नोंद तपासणी</h2>
              <p>
                आधी Upload केलेले Customer ID records
              </p>
            </div>

            <div className="record-count">
              {records.length}
            </div>
          </div>

          <div className="records-table-wrapper">

            <table className="records-table">

              <thead>
                <tr>
                  <th>SR.</th>
                  <th>DATE</th>
                  <th>FRONT</th>
                  <th>BACK</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {records.map((record, index) => (
                  <tr key={record.id}>

                    <td>{index + 1}</td>

                    <td>{record.date}</td>

                    <td>
                      <button className="view-front-button">
                        फोटो पहा
                      </button>
                    </td>

                    <td>
                      <button className="view-back-button">
                        फोटो पहा
                      </button>
                    </td>

                    <td>
                      <span
                        className={
                          record.status === "VERIFIED"
                            ? "record-status verified"
                            : "record-status pending"
                        }
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="verify-edit-button"
                        onClick={() =>
                          navigate(
                            `/manager/verify-edit/${record.id}`
                          )
                        }
                      >
                        VERIFY / EDIT
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CustomerId;