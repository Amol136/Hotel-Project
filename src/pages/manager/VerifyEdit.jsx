import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";
import "../../styles/forms.css";

function VerifyEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [record, setRecord] = useState(null);

  const [frontUrl, setFrontUrl] = useState(null);
  const [backUrl, setBackUrl] = useState(null);

  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================
  // LOAD CUSTOMER RECORD
  // JWT AUTOMATICALLY ADDED BY apiFetch
  // =====================================

  useEffect(() => {
    if (!user?.id || !id) {
      return;
    }

    const loadRecord = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch(
          `/api/customer-ids/${id}?managerId=${user.id}`
        );

        if (!response.ok) {
          const errorText =
            await response.text();

          throw new Error(
            errorText ||
              "Customer ID record load झाला नाही."
          );
        }

        const data =
          await response.json();

        setRecord(data);
      } catch (err) {
        console.error(
          "Record load error:",
          err
        );

        setError(
          err.message ||
            "Customer ID record load झाला नाही."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [id, user?.id]);

  // =====================================
  // LOAD ACTUAL R2 PHOTOS
  // =====================================

  useEffect(() => {
    if (!record?.id) {
      return;
    }

    const loadPhotos = async () => {
      try {
        const [
          frontResponse,
          backResponse,
        ] = await Promise.all([
          apiFetch(
            `/api/customer-ids/${record.id}/front-url`
          ),

          apiFetch(
            `/api/customer-ids/${record.id}/back-url`
          ),
        ]);

        if (frontResponse.ok) {
          const frontData =
            await frontResponse.json();

          setFrontUrl(
            frontData.url || null
          );
        } else {
          const frontError =
            await frontResponse.text();

          console.error(
            "Front photo error:",
            frontError
          );
        }

        if (backResponse.ok) {
          const backData =
            await backResponse.json();

          setBackUrl(
            backData.url || null
          );
        } else {
          const backError =
            await backResponse.text();

          console.error(
            "Back photo error:",
            backError
          );
        }
      } catch (err) {
        console.error(
          "Photo load error:",
          err
        );
      }
    };

    loadPhotos();
  }, [record?.id]);

  // =====================================
  // CLEAN LOCAL FRONT PREVIEW
  // =====================================

  useEffect(() => {
    return () => {
      if (frontPreview) {
        URL.revokeObjectURL(
          frontPreview
        );
      }
    };
  }, [frontPreview]);

  // =====================================
  // CLEAN LOCAL BACK PREVIEW
  // =====================================

  useEffect(() => {
    return () => {
      if (backPreview) {
        URL.revokeObjectURL(
          backPreview
        );
      }
    };
  }, [backPreview]);

  // =====================================
  // SELECT REPLACEMENT PHOTO
  // =====================================

  const handleReplacePhoto = (
    event,
    side
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "कृपया फक्त image file निवडा."
      );

      return;
    }

    setError("");
    setMessage("");

    const previewUrl =
      URL.createObjectURL(file);

    if (side === "front") {
      if (frontPreview) {
        URL.revokeObjectURL(
          frontPreview
        );
      }

      setFrontFile(file);
      setFrontPreview(previewUrl);
    }

    if (side === "back") {
      if (backPreview) {
        URL.revokeObjectURL(
          backPreview
        );
      }

      setBackFile(file);
      setBackPreview(previewUrl);
    }

    setMessage(
      "नवीन फोटो निवडला आहे. VERIFY केल्यावर save होईल."
    );
  };

  // =====================================
  // REPLACE FRONT PHOTO
  // =====================================

  const replaceFrontPhoto =
    async () => {
      if (!frontFile) {
        return null;
      }

      const formData =
        new FormData();

      // सध्याच्या backend endpoint साठी
      formData.append(
        "managerId",
        user.id
      );

      formData.append(
        "frontPhoto",
        frontFile
      );

      const response =
        await apiFetch(
          `/api/customer-ids/${record.id}/replace-front`,
          {
            method: "PUT",
            body: formData,
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Front Photo replace झाला नाही."
        );
      }

      return response.json();
    };

  // =====================================
  // REPLACE BACK PHOTO
  // =====================================

  const replaceBackPhoto =
    async () => {
      if (!backFile) {
        return null;
      }

      const formData =
        new FormData();

      // सध्याच्या backend endpoint साठी
      formData.append(
        "managerId",
        user.id
      );

      formData.append(
        "backPhoto",
        backFile
      );

      const response =
        await apiFetch(
          `/api/customer-ids/${record.id}/replace-back`,
          {
            method: "PUT",
            body: formData,
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Back Photo replace झाला नाही."
        );
      }

      return response.json();
    };

  // =====================================
  // VERIFY CUSTOMER ID
  // =====================================

  const handleVerify = async () => {
    if (
      !record?.id ||
      !user?.id
    ) {
      setError(
        "Record किंवा Manager माहिती मिळाली नाही."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      // -----------------------------
      // REPLACE FRONT IF SELECTED
      // -----------------------------

      if (frontFile) {
        await replaceFrontPhoto();
      }

      // -----------------------------
      // REPLACE BACK IF SELECTED
      // -----------------------------

      if (backFile) {
        await replaceBackPhoto();
      }

      // -----------------------------
      // VERIFY RECORD
      // -----------------------------

      const response =
        await apiFetch(
          `/api/customer-ids/${record.id}/verify?managerId=${user.id}`,
          {
            method: "PUT",
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Customer ID verify झाला नाही."
        );
      }

      const updatedRecord =
        await response.json();

      setRecord(updatedRecord);

      setFrontFile(null);
      setBackFile(null);

      if (frontPreview) {
        URL.revokeObjectURL(
          frontPreview
        );

        setFrontPreview(null);
      }

      if (backPreview) {
        URL.revokeObjectURL(
          backPreview
        );

        setBackPreview(null);
      }

      setMessage(
        "Customer ID successfully VERIFIED."
      );

      setTimeout(() => {
        navigate(
          "/manager/customer-id"
        );
      }, 800);
    } catch (err) {
      console.error(
        "Customer ID verify error:",
        err
      );

      setError(
        err.message ||
          "Customer ID save झाला नाही."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="verify-page">

        <div className="verify-container">

          <h2>
            Customer ID load होत आहे...
          </h2>

        </div>

      </div>
    );
  }

  // =====================================
  // ERROR / RECORD NOT FOUND
  // =====================================

  if (!record) {
    return (
      <div className="verify-page">

        <div className="verify-container">

          <h2>
            {error ||
              "Record सापडला नाही किंवा access नाही."}
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
  // PAGE
  // =====================================

  return (
    <div className="verify-page">

      <div className="verify-container">

        {/* HEADER */}

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
              Customer ID फोटो तपासा
              किंवा बदला
            </p>

          </div>

        </div>

        {/* MANAGER INFO */}

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
              Sub Admin:{" "}
              {user?.subAdminId || "-"}
            </span>

          </div>

        </div>

        {/* DATE + STATUS */}

        <div className="verify-date-section">

          <label>
            DATE
          </label>

          <div className="verify-date">
            {record.date}
          </div>

          <div className="verify-date">
            Status: {record.status}
          </div>

        </div>

        {/* PHOTOS */}

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

              ) : frontUrl ? (

                <img
                  src={frontUrl}
                  alt="Front ID"
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
              चुकीचा फोटो असल्यास नवीन
              फोटो निवडा
            </p>

            <label className="replace-file-button">

              नवीन समोरील फोटो निवडा

              <input
                type="file"
                accept="image/*"
                hidden
                disabled={saving}
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

              ) : backUrl ? (

                <img
                  src={backUrl}
                  alt="Back ID"
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
              चुकीचा फोटो असल्यास नवीन
              फोटो निवडा
            </p>

            <label className="replace-file-button">

              नवीन मागील फोटो निवडा

              <input
                type="file"
                accept="image/*"
                hidden
                disabled={saving}
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

        {/* ERROR */}

        {error && (
          <div className="verify-message">
            {error}
          </div>
        )}

        {/* VERIFY */}

        <button
          type="button"
          className="final-verify-button"
          onClick={handleVerify}
          disabled={saving}
        >
          {saving
            ? "SAVE होत आहे..."
            : "✓ CUSTOMER ID VERIFY करा"}
        </button>

      </div>

    </div>
  );
}

export default VerifyEdit;