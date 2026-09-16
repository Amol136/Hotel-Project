import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "../../styles/forms.css";

function VerifyEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // =====================================
  // LOAD CUSTOMER RECORDS
  // =====================================

  const records =
    JSON.parse(
      localStorage.getItem("customerRecords")
    ) || [];

  // =====================================
  // FIND ONLY LOGGED-IN MANAGER'S RECORD
  // =====================================

  const record = records.find(
    (item) =>
      String(item.id) === String(id) &&
      item.managerId === user?.managerId
  );

  const [frontPreview, setFrontPreview] =
    useState(null);

  const [backPreview, setBackPreview] =
    useState(null);

  const [message, setMessage] =
    useState("");

  // =====================================
  // CLEAN TEMPORARY PREVIEW URLS
  // =====================================

  useEffect(() => {
    return () => {
      if (frontPreview) {
        URL.revokeObjectURL(frontPreview);
      }

      if (backPreview) {
        URL.revokeObjectURL(backPreview);
      }
    };
  }, [frontPreview, backPreview]);

  // =====================================
  // RECORD NOT FOUND / NO ACCESS
  // =====================================

  if (!record) {
    return (
      <div className="verify-page">

        <div className="verify-container">

          <h2>
            Record सापडला नाही किंवा या
            record वर तुम्हाला access नाही.
          </h2>

          <button
            type="button"
            className="verify-back-button"
            onClick={() =>
              navigate(
                "/manager/customer-id"
              )
            }
          >
            ← BACK
          </button>

        </div>

      </div>
    );
  }

  // =====================================
  // REPLACE PHOTO
  // =====================================

  const handleReplacePhoto = (
    event,
    side
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(
        "कृपया फक्त image निवडा."
      );
      return;
    }

    const newPreview =
      URL.createObjectURL(file);

    if (side === "front") {
      if (frontPreview) {
        URL.revokeObjectURL(
          frontPreview
        );
      }

      setFrontPreview(newPreview);
    }

    if (side === "back") {
      if (backPreview) {
        URL.revokeObjectURL(
          backPreview
        );
      }

      setBackPreview(newPreview);
    }

    setMessage(
      "नवीन फोटो निवडला आहे."
    );
  };

  // =====================================
  // VERIFY CUSTOMER ID
  // =====================================

  const handleVerify = () => {
    // Extra ownership check
    if (
      record.managerId !==
      user?.managerId
    ) {
      setMessage(
        "या Customer ID record वर तुम्हाला access नाही."
      );
      return;
    }

    const updatedRecords =
      records.map((item) => {
        // Update only this Manager's record
        if (
          String(item.id) ===
            String(id) &&
          item.managerId ===
            user?.managerId
        ) {
          return {
            ...item,
            status: "VERIFIED",
            verifiedAt:
              new Date().toISOString(),
          };
        }

        return item;
      });

    localStorage.setItem(
      "customerRecords",
      JSON.stringify(updatedRecords)
    );

    setMessage(
      "Customer ID successfully VERIFIED."
    );

    setTimeout(() => {
      navigate(
        "/manager/customer-id"
      );
    }, 700);
  };

  return (
    <div className="verify-page">

      <div className="verify-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="verify-header">

          <button
            type="button"
            className="verify-back-button"
            onClick={() =>
              navigate(
                "/manager/customer-id"
              )
            }
          >
            ← BACK
          </button>

          <div>

            <h1>
              ID Check करा
            </h1>

            <p>
              Customer ID फोटो तपासा किंवा बदला
            </p>

          </div>

        </div>

        {/* =========================
            MANAGER INFO
        ========================= */}

        <div className="verify-manager-info">

          <div>

            <small>
              LOGGED IN MANAGER
            </small>

            <strong>
              {user?.name || "Manager"}
            </strong>

          </div>

          <div className="verify-manager-badges">

            <span>
              {user?.managerId || "-"}
            </span>

            <span>
              {user?.subAdminId || "-"}
            </span>

          </div>

        </div>

        {/* =========================
            DATE
        ========================= */}

        <div className="verify-date-section">

          <label>
            DATE
          </label>

          <div className="verify-date">
            {record.date}
          </div>

        </div>

        {/* =========================
            PHOTOS
        ========================= */}

        <div className="verify-photo-grid">

          {/* FRONT */}

          <div className="verify-photo-card">

            <div className="verify-photo-title">

              <h3>
                समोरील बाजू
              </h3>

              <span className="available-badge">
                AVAILABLE
              </span>

            </div>

            <div className="verify-image-area">

              {frontPreview ? (

                <img
                  src={frontPreview}
                  alt="Front replacement"
                />

              ) : (

                <div className="demo-photo">

                  <span>
                    🪪
                  </span>

                  <p>
                    Front ID Photo
                  </p>

                </div>

              )}

            </div>

            <p className="replace-text">
              चुकीचा फोटो असल्यास नवीन फोटो निवडा
            </p>

            <label className="replace-file-button">

              नवीन समोरील फोटो निवडा

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) =>
                  handleReplacePhoto(
                    event,
                    "front"
                  )
                }
              />

            </label>

          </div>

          {/* BACK */}

          <div className="verify-photo-card">

            <div className="verify-photo-title">

              <h3>
                मागील बाजू
              </h3>

              <span className="available-badge">
                AVAILABLE
              </span>

            </div>

            <div className="verify-image-area">

              {backPreview ? (

                <img
                  src={backPreview}
                  alt="Back replacement"
                />

              ) : (

                <div className="demo-photo">

                  <span>
                    🪪
                  </span>

                  <p>
                    Back ID Photo
                  </p>

                </div>

              )}

            </div>

            <p className="replace-text">
              चुकीचा फोटो असल्यास नवीन फोटो निवडा
            </p>

            <label className="replace-file-button">

              नवीन मागील फोटो निवडा

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) =>
                  handleReplacePhoto(
                    event,
                    "back"
                  )
                }
              />

            </label>

          </div>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="verify-message">
            {message}
          </div>
        )}

        {/* =========================
            VERIFY BUTTON
        ========================= */}

        <button
          type="button"
          className="final-verify-button"
          onClick={handleVerify}
        >
          ✓ CUSTOMER ID VERIFY करा
        </button>

      </div>

    </div>
  );
}

export default VerifyEdit;