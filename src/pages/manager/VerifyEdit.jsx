import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/forms.css";

function VerifyEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const records =
    JSON.parse(localStorage.getItem("customerRecords")) || [];

  const record = records.find(
    (item) => String(item.id) === String(id)
  );

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [message, setMessage] = useState("");

  if (!record) {
    return (
      <div className="verify-page">
        <div className="verify-container">
          <h2>Record सापडला नाही.</h2>

          <button
            className="verify-back-button"
            onClick={() =>
              navigate("/manager/customer-id")
            }
          >
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  const handleReplacePhoto = (event, side) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("कृपया फक्त image निवडा.");
      return;
    }

    const preview = URL.createObjectURL(file);

    if (side === "front") {
      setFrontPreview(preview);
    }

    if (side === "back") {
      setBackPreview(preview);
    }

    setMessage("नवीन फोटो निवडला आहे.");
  };

  const handleVerify = () => {
    const updatedRecords = records.map((item) => {
      if (String(item.id) === String(id)) {
        return {
          ...item,
          status: "VERIFIED",
        };
      }

      return item;
    });

    localStorage.setItem(
      "customerRecords",
      JSON.stringify(updatedRecords)
    );

    setMessage("Customer ID successfully VERIFIED.");

    setTimeout(() => {
      navigate("/manager/customer-id");
    }, 700);
  };

  return (
    <div className="verify-page">

      <div className="verify-container">

        {/* HEADER */}

        <div className="verify-header">

          <button
            className="verify-back-button"
            onClick={() =>
              navigate("/manager/customer-id")
            }
          >
            ← BACK
          </button>

          <div>
            <h1>ID Check करा</h1>
            <p>Customer ID फोटो तपासा किंवा बदला</p>
          </div>

        </div>

        {/* DATE */}

        <div className="verify-date-section">
          <label>DATE</label>

          <div className="verify-date">
            {record.date}
          </div>
        </div>

        {/* PHOTOS */}

        <div className="verify-photo-grid">

          {/* FRONT */}

          <div className="verify-photo-card">

            <div className="verify-photo-title">

              <h3>समोरील बाजू</h3>

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
                  <span>🪪</span>
                  <p>Front ID Photo</p>
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
                  handleReplacePhoto(event, "front")
                }
              />
            </label>

          </div>

          {/* BACK */}

          <div className="verify-photo-card">

            <div className="verify-photo-title">

              <h3>मागील बाजू</h3>

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
                  <span>🪪</span>
                  <p>Back ID Photo</p>
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
                  handleReplacePhoto(event, "back")
                }
              />
            </label>

          </div>

        </div>

        {message && (
          <div className="verify-message">
            {message}
          </div>
        )}

        {/* VERIFY BUTTON */}

        <button
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