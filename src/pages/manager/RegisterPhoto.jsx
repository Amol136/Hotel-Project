import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";
import "../../styles/forms.css";
import "../../styles/tables.css";

function RegisterPhoto() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================================
  // REFS
  // =====================================================

  const galleryRef = useRef(null);
  const cropImageRef = useRef(null);
  const cropAreaRef = useRef(null);

  // फक्त नवीन Crop box move / resize साठी
  const cropDragRef = useRef(null);
  const cropResizeRef = useRef(null);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // =====================================================
  // DATE
  // =====================================================

  const today = new Date().toISOString().split("T")[0];

  // =====================================================
  // FORM
  // =====================================================

  const [date, setDate] = useState(today);

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  // =====================================================
  // RECORDS
  // =====================================================

  const [records, setRecords] = useState([]);
  const [searchDate, setSearchDate] = useState("");

  // =====================================================
  // UI
  // =====================================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // =====================================================
  // CAMERA
  // =====================================================

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // =====================================================
  // CROP
  // =====================================================

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState("");

  // नवीन movable / resizable crop box
  const [cropBox, setCropBox] = useState({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  // =====================================================
  // PHOTO VIEWER
  // =====================================================

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");

  const [viewerDownloadUrl, setViewerDownloadUrl] =
    useState("");

  // =====================================================
  // RESET CROP BOX
  // =====================================================

  const resetCropBox = () => {
    setCropBox({
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });

    cropDragRef.current = null;
    cropResizeRef.current = null;
  };

  // =====================================================
  // LOAD REGISTER PHOTOS
  // =====================================================

  useEffect(() => {
    if (!user?.id || user?.role !== "MANAGER") {
      return;
    }

    const loadRecords = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch(
          `/api/register-photos/manager/${user.id}`
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            errorText ||
              "Register Photos load झाले नाहीत."
          );
        }

        const data = await response.json();

        setRecords(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Register Photos load error:",
          err
        );

        setError(
          err.message ||
            "Register Photos load झाले नाहीत."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [user?.id, user?.role]);

  // =====================================================
  // DATE SEARCH
  // Date select करेपर्यंत कोणताही record दिसणार नाही
  // =====================================================

  const filteredRecords = searchDate
    ? records.filter(
        (record) =>
          String(record.date || "") ===
          searchDate
      )
    : [];

  // =====================================================
  // STOP CAMERA
  // =====================================================

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraError("");
  };

  // =====================================================
  // OPEN REAL LIVE CAMERA
  // =====================================================

  const openCamera = async () => {
    try {
      setCameraError("");
      setMessage("");
      setError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "या browser मध्ये Camera support उपलब्ध नाही."
        );
      }

      // Previous stream बंद करा
      if (cameraStreamRef.current) {
        cameraStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        cameraStreamRef.current = null;
      }

      let stream;

      // Mobile वर rear camera prefer करतो
      try {
        stream =
          await navigator.mediaDevices.getUserMedia({
            audio: false,

            video: {
              facingMode: {
                ideal: "environment",
              },

              width: {
                ideal: 1920,
              },

              height: {
                ideal: 1080,
              },
            },
          });
      } catch (firstError) {
        /*
         * काही laptop/mobile browser मध्ये
         * facingMode मुळे camera मिळत नाही.
         * म्हणून सामान्य camera fallback.
         */

        if (
          firstError.name === "NotFoundError" ||
          firstError.name === "OverconstrainedError"
        ) {
          stream =
            await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: true,
            });
        } else {
          throw firstError;
        }
      }

      cameraStreamRef.current = stream;

      setCameraOpen(true);

      // Modal render झाल्यावर video ला stream द्या
      setTimeout(async () => {
        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error(
            "Camera video play error:",
            playError
          );
        }
      }, 100);
    } catch (err) {
      console.error(
        "Camera open error:",
        err
      );

      let cameraMessage =
        "Camera सुरू करता आला नाही.";

      if (err.name === "NotAllowedError") {
        cameraMessage =
          "Camera permission मिळाली नाही. Browser मध्ये Camera Allow करा.";
      } else if (err.name === "NotFoundError") {
        cameraMessage =
          "या device वर Camera सापडला नाही.";
      } else if (err.name === "NotReadableError") {
        cameraMessage =
          "Camera दुसऱ्या application मध्ये वापरला जात आहे.";
      } else if (
        err.name === "OverconstrainedError"
      ) {
        cameraMessage =
          "या device साठी योग्य Camera setting मिळाली नाही.";
      } else if (err.message) {
        cameraMessage = err.message;
      }

      setCameraError(cameraMessage);
      setError(cameraMessage);
    }
  };

  // =====================================================
  // CAPTURE CAMERA PHOTO
  // =====================================================

  const captureCameraPhoto = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setCameraError(
        "Camera तयार होत आहे. कृपया पुन्हा Capture करा."
      );

      return;
    }

    const canvas =
      document.createElement("canvas");

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setCameraError(
        "Camera photo तयार करता आला नाही."
      );

      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const capturedImage =
      canvas.toDataURL(
        "image/jpeg",
        0.95
      );

    stopCamera();

    // Camera capture नंतर Crop उघडा
    setCropSource(
      capturedImage
    );

    resetCropBox();

    setCropOpen(true);

    setMessage("");
    setError("");
  };

  // =====================================================
  // CAMERA CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  // =====================================================
  // GALLERY PHOTO
  // =====================================================

  const handleGalleryPhoto = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "कृपया फक्त फोटो निवडा."
      );

      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setCropSource(
        reader.result
      );

      resetCropBox();

      setCropOpen(true);

      setMessage("");
      setError("");
    };

    reader.readAsDataURL(file);

    // Same image पुन्हा select करता यावा
    event.target.value = "";
  };

  // =====================================================
  // COMPRESS IMAGE TO MAXIMUM 160 KB
  // =====================================================

  const canvasToCompressedBlob = async (
    sourceCanvas,
    maxBytes = 160 * 1024
  ) => {
    let workingCanvas =
      sourceCanvas;

    let quality = 0.92;

    let blob =
      await new Promise(
        (resolve) => {
          workingCanvas.toBlob(
            resolve,
            "image/jpeg",
            quality
          );
        }
      );

    // -----------------------------------------
    // QUALITY कमी करा
    // -----------------------------------------

    while (
      blob &&
      blob.size > maxBytes &&
      quality > 0.3
    ) {
      quality -= 0.06;

      blob =
        await new Promise(
          (resolve) => {
            workingCanvas.toBlob(
              resolve,
              "image/jpeg",
              quality
            );
          }
        );
    }

    // -----------------------------------------
    // तरीही >160KB असेल तर dimensions कमी करा
    // -----------------------------------------

    let attempts = 0;

    while (
      blob &&
      blob.size > maxBytes &&
      attempts < 10
    ) {
      attempts += 1;

      const smallerCanvas =
        document.createElement(
          "canvas"
        );

      smallerCanvas.width =
        Math.max(
          400,
          Math.floor(
            workingCanvas.width *
              0.85
          )
        );

      smallerCanvas.height =
        Math.max(
          400,
          Math.floor(
            workingCanvas.height *
              0.85
          )
        );

      const smallerContext =
        smallerCanvas.getContext(
          "2d"
        );

      if (!smallerContext) {
        break;
      }

      smallerContext.fillStyle =
        "#ffffff";

      smallerContext.fillRect(
        0,
        0,
        smallerCanvas.width,
        smallerCanvas.height
      );

      smallerContext.drawImage(
        workingCanvas,
        0,
        0,
        smallerCanvas.width,
        smallerCanvas.height
      );

      workingCanvas =
        smallerCanvas;

      blob =
        await new Promise(
          (resolve) => {
            workingCanvas.toBlob(
              resolve,
              "image/jpeg",
              0.7
            );
          }
        );
    }

    return blob;
  };

  // =====================================================
  // APPLY CROP
  // नवीन movable / resizable crop box
  // =====================================================

  const applyCrop = async () => {
    const image =
      cropImageRef.current;

    if (!image) {
      return;
    }

    try {
      setMessage(
        "फोटो Crop आणि Compress होत आहे..."
      );

      setError("");

      const naturalWidth =
        image.naturalWidth;

      const naturalHeight =
        image.naturalHeight;

      if (
        !naturalWidth ||
        !naturalHeight
      ) {
        throw new Error(
          "फोटो पूर्ण load झाला नाही."
        );
      }

      // Crop box percentage -> original photo pixels
      const displayedWidth = image.clientWidth;
const displayedHeight = image.clientHeight;

// object-fit: cover scale
const coverScale = Math.max(
  displayedWidth / naturalWidth,
  displayedHeight / naturalHeight
);

const renderedWidth =
  naturalWidth * coverScale;

const renderedHeight =
  naturalHeight * coverScale;

// cover मुळे image चा बाहेर गेलेला भाग
const hiddenX =
  (renderedWidth - displayedWidth) / 2;

const hiddenY =
  (renderedHeight - displayedHeight) / 2;

// Crop box चे displayed pixels
const cropDisplayX =
  (cropBox.x / 100) * displayedWidth;

const cropDisplayY =
  (cropBox.y / 100) * displayedHeight;

const cropDisplayWidth =
  (cropBox.width / 100) * displayedWidth;

const cropDisplayHeight =
  (cropBox.height / 100) * displayedHeight;

// Display coordinates -> original photo coordinates
const sourceX =
  (cropDisplayX + hiddenX) / coverScale;

const sourceY =
  (cropDisplayY + hiddenY) / coverScale;

const sourceWidth =
  cropDisplayWidth / coverScale;

const sourceHeight =
  cropDisplayHeight / coverScale;

      if (
        sourceWidth <= 0 ||
        sourceHeight <= 0
      ) {
        throw new Error(
          "Crop area योग्य नाही."
        );
      }

      /*
       * Register Photo stretch होऊ नये म्हणून
       * selected crop चा original ratio ठेवतो.
       * Maximum output 1200 x 1200.
       */

      const maxOutputWidth = 1200;
      const maxOutputHeight = 1200;

      let outputWidth =
        Math.round(sourceWidth);

      let outputHeight =
        Math.round(sourceHeight);

      const outputScale =
        Math.min(
          1,
          maxOutputWidth /
            outputWidth,
          maxOutputHeight /
            outputHeight
        );

      outputWidth =
        Math.max(
          1,
          Math.round(
            outputWidth *
              outputScale
          )
        );

      outputHeight =
        Math.max(
          1,
          Math.round(
            outputHeight *
              outputScale
          )
        );

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        outputWidth;

      canvas.height =
        outputHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "फोटो तयार करता आला नाही."
        );
      }

      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        outputWidth,
        outputHeight
      );

      // फक्त crop box मधील selected area save
      context.drawImage(
        image,

        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,

        0,
        0,
        outputWidth,
        outputHeight
      );

      // Maximum 160 KB
      const blob =
        await canvasToCompressedBlob(
          canvas,
          160 * 1024
        );

      if (!blob) {
        throw new Error(
          "फोटो Compress करता आला नाही."
        );
      }

      if (
        blob.size >
        160 * 1024
      ) {
        throw new Error(
          "फोटो 160 KB पर्यंत Compress झाला नाही. कृपया पुन्हा प्रयत्न करा."
        );
      }

      const compressedFile =
        new File(
          [blob],

          `register-photo-${Date.now()}.jpg`,

          {
            type: "image/jpeg",
          }
        );

      // जुना preview URL remove
      if (preview) {
        URL.revokeObjectURL(
          preview
        );
      }

      const previewUrl =
        URL.createObjectURL(
          compressedFile
        );

      setPhoto(
        compressedFile
      );

      setPreview(
        previewUrl
      );

      setCropOpen(false);
      setCropSource("");

      resetCropBox();

      setMessage(
        `फोटो तयार झाला - ${Math.ceil(
          blob.size / 1024
        )} KB`
      );
    } catch (err) {
      console.error(
        "Register crop error:",
        err
      );

      setError(
        err.message ||
          "फोटो Crop करताना error आला."
      );
    }
  };

  // =====================================================
  // CANCEL CROP
  // =====================================================

  const cancelCrop = () => {
    setCropOpen(false);
    setCropSource("");

    resetCropBox();
  };

  // =====================================================
  // REMOVE PHOTO
  // =====================================================

  const removePhoto = () => {
    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setPhoto(null);
    setPreview(null);

    if (galleryRef.current) {
      galleryRef.current.value =
        "";
    }
  };

  // =====================================================
  // PREVIEW CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(
          preview
        );
      }
    };
  }, [preview]);
    // =====================================================
  // UPLOAD REGISTER PHOTO
  // =====================================================

  const handleUpload = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !user ||
      user.role !== "MANAGER" ||
      !user.id
    ) {
      setError(
        "Manager login माहिती मिळाली नाही. कृपया पुन्हा login करा."
      );

      return;
    }

    if (!date) {
      setError(
        "कृपया तारीख निवडा."
      );

      return;
    }

    if (!photo) {
      setError(
        "कृपया Register Photo निवडा आणि Crop करा."
      );

      return;
    }

    // अंतिम 160 KB safety check
    if (
      photo.size >
      160 * 1024
    ) {
      setError(
        "फोटो 160 KB पेक्षा मोठा आहे. कृपया पुन्हा Crop करा."
      );

      return;
    }

    try {
      setUploading(true);

      setMessage(
        "Register Photo Upload होत आहे..."
      );

      const formData =
        new FormData();

      /*
       * Backend JWT authorization authenticated
       * Manager वरून होते.
       * Existing API compatibility साठी managerId
       * field ठेवलेला आहे.
       */

      formData.append(
        "managerId",
        user.id
      );

      formData.append(
        "date",
        date
      );

      formData.append(
        "photo",
        photo
      );

      const response =
        await apiFetch(
          "/api/register-photos/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Register Photo upload झाला नाही."
        );
      }

      const newRecord =
        await response.json();

      setRecords(
        (currentRecords) => [
          newRecord,

          ...currentRecords.filter(
            (record) =>
              Number(record.id) !==
              Number(newRecord.id)
          ),
        ]
      );

      setMessage(
        "Register Photo यशस्वीरीत्या Upload झाला."
      );

      removePhoto();
    } catch (err) {
      console.error(
        "Register Photo upload error:",
        err
      );

      setError(
        err.message ||
          "Register Photo upload झाला नाही."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // VIEW PHOTO
  // View + Download URLs
  // =====================================================

  const handleViewPhoto = async (
    record
  ) => {
    if (!user?.id) {
      setError(
        "Manager login माहिती मिळाली नाही."
      );

      return;
    }

    try {
      setError("");

      setMessage(
        "फोटो उघडत आहे..."
      );

      const [
        viewResponse,
        downloadResponse,
      ] = await Promise.all([
        apiFetch(
          `/api/register-photos/${record.id}/photo-url?managerId=${user.id}`
        ),

        apiFetch(
          `/api/register-photos/${record.id}/download-url?managerId=${user.id}`
        ),
      ]);

      if (!viewResponse.ok) {
        const errorText =
          await viewResponse.text();

        throw new Error(
          errorText ||
            "Register Photo उघडला नाही."
        );
      }

      if (!downloadResponse.ok) {
        const errorText =
          await downloadResponse.text();

        throw new Error(
          errorText ||
            "Download URL मिळाला नाही."
        );
      }

      const viewData =
        await viewResponse.json();

      const downloadData =
        await downloadResponse.json();

      if (!viewData?.url) {
        throw new Error(
          "Photo URL मिळाला नाही."
        );
      }

      setViewerUrl(
        viewData.url
      );

      setViewerDownloadUrl(
        downloadData?.url || ""
      );

      setViewerOpen(true);
      setMessage("");
    } catch (err) {
      console.error(
        "Register Photo view error:",
        err
      );

      setError(
        err.message ||
          "Register Photo उघडला नाही."
      );
    }
  };

  // =====================================================
  // CLOSE VIEWER
  // =====================================================

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl("");
    setViewerDownloadUrl("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="customer-page">

      {/* =================================================
          HEADER
      ================================================= */}

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

        {/* =================================================
            LOGGED IN MANAGER
        ================================================= */}

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

        {/* =================================================
            REGISTER PHOTO UPLOAD
        ================================================= */}

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
                तारीख निवडा आणि Camera किंवा
                Gallery मधून Register Photo
                निवडा.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleUpload}
          >

            {/* DATE */}

            <div className="customer-form-group">

              <label>
                तारीख
              </label>

              <input
                type="date"
                value={date}
                disabled={uploading}
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
                      ? `${Math.ceil(
                          photo.size /
                            1024
                        )} KB`
                      : "PENDING"}
                  </span>

                </div>

                {/* PHOTO PREVIEW */}

                {preview ? (

                  <div className="register-photo-preview">

                    <img
                      src={preview}
                      alt="Register Preview"
                    />

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={
                        removePhoto
                      }
                      disabled={
                        uploading
                      }
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

                {/* CAMERA / GALLERY */}

                <div className="photo-buttons">

                  {/* IMPORTANT:
                      हा button आता file picker
                      उघडत नाही.
                      तो REAL LIVE CAMERA उघडतो.
                  */}

                  <button
                    type="button"
                    className="camera-button"
                    disabled={uploading}
                    onClick={
                      openCamera
                    }
                  >
                    📷 कॅमेरा
                  </button>

                  <button
                    type="button"
                    className="gallery-button"
                    disabled={uploading}
                    onClick={() =>
                      galleryRef.current?.click()
                    }
                  >
                    🖼️ गॅलरी
                  </button>

                </div>

                {/* ONLY GALLERY FILE INPUT */}

                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={
                    handleGalleryPhoto
                  }
                />

              </div>

            </div>

            {/* MESSAGE */}

            {message && (

              <div className="customer-message">
                {message}
              </div>

            )}

            {/* ERROR */}

            {error && (

              <div className="customer-message">
                {error}
              </div>

            )}

            {/* UPLOAD */}

            <button
              type="submit"
              className="upload-customer-button"
              disabled={uploading}
            >
              {uploading
                ? "UPLOAD होत आहे..."
                : "📤 REGISTER PHOTO UPLOAD करा"}
            </button>

          </form>

        </section>

        {/* =================================================
            REGISTER PHOTO SEARCH
        ================================================= */}

        <section className="records-panel">

          <div className="records-heading">

            <div>
              <h2>
                Register Photo Search
              </h2>

              <p>
                तारीख निवडून Register Photo
                Search करा.
              </p>
            </div>

            <div>

              <input
                type="date"
                value={searchDate}
                onChange={(event) =>
                  setSearchDate(
                    event.target.value
                  )
                }
              />

            </div>

          </div>

          {/* Date select केलेली नाही */}

          {!searchDate ? (

            <div className="empty-register-records">

              <div>
                🔎
              </div>

              <h3>
                तारीख निवडा
              </h3>

              <p>
                Register Photo पाहण्यासाठी
                तारीख Search करा.
              </p>

            </div>

          ) : loading ? (

            <div className="empty-register-records">

              <h3>
                Register Photos load होत आहेत...
              </h3>

            </div>

          ) : filteredRecords.length === 0 ? (

            <div className="empty-register-records">

              <div>
                📷
              </div>

              <h3>
                या तारखेचा Register Photo नाही
              </h3>

              <p>
                निवडलेल्या तारखेला कोणताही
                Register Photo सापडला नाही.
              </p>

            </div>

          ) : (

            <div className="records-table-wrapper">

              <table className="records-table">

                <thead>
                  <tr>

                    <th>
                      SR.
                    </th>

                    <th>
                      DATE
                    </th>

                    <th>
                      PHOTO
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map(
                    (
                      record,
                      index
                    ) => (

                      <tr
                        key={
                          record.id
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {
                            record.date
                          }
                        </td>

                        <td>

                          <button
                            type="button"
                            className="view-front-button"
                            onClick={() =>
                              handleViewPhoto(
                                record
                              )
                            }
                          >
                            फोटो पहा
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

      {/* =================================================
          LIVE CAMERA MODAL
      ================================================= */}

      {cameraOpen && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.92)",
            zIndex: 12000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
          }}
        >

          <div
            style={{
              width:
                "min(760px, 100%)",
              maxHeight: "95vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "18px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                }}
              >
                Register Photo Camera
              </h2>

              <button
                type="button"
                onClick={
                  stopCamera
                }
              >
                ✕
              </button>

            </div>

            <div
              style={{
                background: "#000",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />

            </div>

            {cameraError && (

              <div
                className="customer-message"
                style={{
                  marginTop: "12px",
                }}
              >
                {cameraError}
              </div>

            )}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "16px",
              }}
            >

              <button
                type="button"
                className="upload-customer-button"
                onClick={
                  captureCameraPhoto
                }
              >
                📸 CAPTURE PHOTO
              </button>

              <button
                type="button"
                onClick={
                  stopCamera
                }
              >
                CANCEL
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          CROP MODAL
          PART 3 इथून पुढे
      ================================================= */}
            {cropOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            zIndex: 11000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
          }}
        >
          <div
            style={{
              width: "min(760px, 100%)",
              maxHeight: "95vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "16px",
              padding: "16px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "6px",
              }}
            >
              Register Photo Crop करा
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: "14px",
                fontSize: "14px",
              }}
            >
              Crop Box हलवा किंवा कोपऱ्यांवरील
              handles Drag करून हवा तेवढा भाग निवडा.
            </p>

            {/* =====================================
                FULL PHOTO + CROP AREA
            ===================================== */}

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                background: "#111",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                ref={cropAreaRef}
                style={{
                  position: "relative",
                  display: "inline-block",
                  maxWidth: "100%",
                  lineHeight: 0,
                  overflow: "hidden",
                  userSelect: "none",
                  touchAction: "none",
                }}
              >
                {/* FULL PHOTO */}

                <img
  ref={cropImageRef}
  src={cropSource}
  alt="Register Crop"
  draggable="false"
  onDragStart={(event) => event.preventDefault()}
  style={{
    display: "block",
    width: "100%",
    height: "65vh",
    objectFit: "cover",
    objectPosition: "center",
    userSelect: "none",
    WebkitUserDrag: "none",
    pointerEvents: "none",
  }}
/>
                {/* =====================================
                    MOVABLE CROP BOX
                ===================================== */}

                <div
                  style={{
                    position: "absolute",
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                    border: "2px dashed #fff",
                    boxSizing: "border-box",
                    cursor: "move",
                    touchAction: "none",
                    zIndex: 10,
                    boxShadow:
                      "0 0 0 9999px rgba(0,0,0,0.48)",
                  }}
                  onPointerDown={(event) => {
                    if (
                      event.target.dataset.resize ===
                      "true"
                    ) {
                      return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    try {
                      event.currentTarget.setPointerCapture(
                        event.pointerId
                      );
                    } catch {
                      // Ignore
                    }

                    cropDragRef.current = {
                      pointerX: event.clientX,
                      pointerY: event.clientY,

                      startX: cropBox.x,
                      startY: cropBox.y,

                      width: cropBox.width,
                      height: cropBox.height,
                    };
                  }}
                  onPointerMove={(event) => {
                    if (!cropDragRef.current) {
                      return;
                    }

                    event.preventDefault();

                    const area =
                      cropAreaRef.current?.getBoundingClientRect();

                    if (
                      !area ||
                      !area.width ||
                      !area.height
                    ) {
                      return;
                    }

                    const dx =
                      ((event.clientX -
                        cropDragRef.current.pointerX) /
                        area.width) *
                      100;

                    const dy =
                      ((event.clientY -
                        cropDragRef.current.pointerY) /
                        area.height) *
                      100;

                    let newX =
                      cropDragRef.current.startX +
                      dx;

                    let newY =
                      cropDragRef.current.startY +
                      dy;

                    newX = Math.max(
                      0,
                      Math.min(
                        newX,
                        100 -
                          cropDragRef.current.width
                      )
                    );

                    newY = Math.max(
                      0,
                      Math.min(
                        newY,
                        100 -
                          cropDragRef.current.height
                      )
                    );

                    setCropBox((previous) => ({
                      ...previous,
                      x: newX,
                      y: newY,
                    }));
                  }}
                  onPointerUp={(event) => {
                    try {
                      event.currentTarget.releasePointerCapture(
                        event.pointerId
                      );
                    } catch {
                      // Ignore
                    }

                    cropDragRef.current = null;
                  }}
                  onPointerCancel={() => {
                    cropDragRef.current = null;
                  }}
                >
                  {/* =====================================
                      3 x 3 GRID
                  ===================================== */}

                  <div
                    style={{
                      position: "absolute",
                      left: "33.333%",
                      top: 0,
                      bottom: 0,
                      width: "1px",
                      background:
                        "rgba(255,255,255,0.85)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: "66.666%",
                      top: 0,
                      bottom: 0,
                      width: "1px",
                      background:
                        "rgba(255,255,255,0.85)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: "33.333%",
                      left: 0,
                      right: 0,
                      height: "1px",
                      background:
                        "rgba(255,255,255,0.85)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: "66.666%",
                      left: 0,
                      right: 0,
                      height: "1px",
                      background:
                        "rgba(255,255,255,0.85)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* =====================================
                      TOP LEFT
                  ===================================== */}

                  <div
                    data-resize="true"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      try {
                        event.currentTarget.setPointerCapture(
                          event.pointerId
                        );
                      } catch {
                        // Ignore
                      }

                      cropResizeRef.current = {
                        corner: "tl",

                        pointerX: event.clientX,
                        pointerY: event.clientY,

                        startBox: {
                          ...cropBox,
                        },
                      };
                    }}
                    onPointerMove={(event) => {
                      const resize =
                        cropResizeRef.current;

                      if (
                        !resize ||
                        resize.corner !== "tl"
                      ) {
                        return;
                      }

                      event.preventDefault();

                      const area =
                        cropAreaRef.current?.getBoundingClientRect();

                      if (
                        !area ||
                        !area.width ||
                        !area.height
                      ) {
                        return;
                      }

                      const dx =
                        ((event.clientX -
                          resize.pointerX) /
                          area.width) *
                        100;

                      const dy =
                        ((event.clientY -
                          resize.pointerY) /
                          area.height) *
                        100;

                      const start =
                        resize.startBox;

                      let newX =
                        start.x + dx;

                      let newY =
                        start.y + dy;

                      let newWidth =
                        start.width - dx;

                      let newHeight =
                        start.height - dy;

                      if (newX < 0) {
                        newWidth += newX;
                        newX = 0;
                      }

                      if (newY < 0) {
                        newHeight += newY;
                        newY = 0;
                      }

                      if (
                        newWidth < 10 ||
                        newHeight < 10
                      ) {
                        return;
                      }

                      setCropBox({
                        x: newX,
                        y: newY,
                        width: newWidth,
                        height: newHeight,
                      });
                    }}
                    onPointerUp={() => {
                      cropResizeRef.current = null;
                    }}
                    onPointerCancel={() => {
                      cropResizeRef.current = null;
                    }}
                    style={{
                      position: "absolute",
                      left: "-9px",
                      top: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #111",
                      cursor: "nwse-resize",
                      zIndex: 30,
                      touchAction: "none",
                    }}
                  />

                  {/* =====================================
                      TOP RIGHT
                  ===================================== */}

                  <div
                    data-resize="true"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      try {
                        event.currentTarget.setPointerCapture(
                          event.pointerId
                        );
                      } catch {
                        // Ignore
                      }

                      cropResizeRef.current = {
                        corner: "tr",

                        pointerX: event.clientX,
                        pointerY: event.clientY,

                        startBox: {
                          ...cropBox,
                        },
                      };
                    }}
                    onPointerMove={(event) => {
                      const resize =
                        cropResizeRef.current;

                      if (
                        !resize ||
                        resize.corner !== "tr"
                      ) {
                        return;
                      }

                      event.preventDefault();

                      const area =
                        cropAreaRef.current?.getBoundingClientRect();

                      if (
                        !area ||
                        !area.width ||
                        !area.height
                      ) {
                        return;
                      }

                      const dx =
                        ((event.clientX -
                          resize.pointerX) /
                          area.width) *
                        100;

                      const dy =
                        ((event.clientY -
                          resize.pointerY) /
                          area.height) *
                        100;

                      const start =
                        resize.startBox;

                      let newY =
                        start.y + dy;

                      let newWidth =
                        start.width + dx;

                      let newHeight =
                        start.height - dy;

                      if (newY < 0) {
                        newHeight += newY;
                        newY = 0;
                      }

                      if (
                        start.x + newWidth >
                        100
                      ) {
                        newWidth =
                          100 - start.x;
                      }

                      if (
                        newWidth < 10 ||
                        newHeight < 10
                      ) {
                        return;
                      }

                      setCropBox({
                        x: start.x,
                        y: newY,
                        width: newWidth,
                        height: newHeight,
                      });
                    }}
                    onPointerUp={() => {
                      cropResizeRef.current = null;
                    }}
                    onPointerCancel={() => {
                      cropResizeRef.current = null;
                    }}
                    style={{
                      position: "absolute",
                      right: "-9px",
                      top: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #111",
                      cursor: "nesw-resize",
                      zIndex: 30,
                      touchAction: "none",
                    }}
                  />

                  {/* =====================================
                      BOTTOM LEFT
                  ===================================== */}

                  <div
                    data-resize="true"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      try {
                        event.currentTarget.setPointerCapture(
                          event.pointerId
                        );
                      } catch {
                        // Ignore
                      }

                      cropResizeRef.current = {
                        corner: "bl",

                        pointerX: event.clientX,
                        pointerY: event.clientY,

                        startBox: {
                          ...cropBox,
                        },
                      };
                    }}
                    onPointerMove={(event) => {
                      const resize =
                        cropResizeRef.current;

                      if (
                        !resize ||
                        resize.corner !== "bl"
                      ) {
                        return;
                      }

                      event.preventDefault();

                      const area =
                        cropAreaRef.current?.getBoundingClientRect();

                      if (
                        !area ||
                        !area.width ||
                        !area.height
                      ) {
                        return;
                      }

                      const dx =
                        ((event.clientX -
                          resize.pointerX) /
                          area.width) *
                        100;

                      const dy =
                        ((event.clientY -
                          resize.pointerY) /
                          area.height) *
                        100;

                      const start =
                        resize.startBox;

                      let newX =
                        start.x + dx;

                      let newWidth =
                        start.width - dx;

                      let newHeight =
                        start.height + dy;

                      if (newX < 0) {
                        newWidth += newX;
                        newX = 0;
                      }

                      if (
                        start.y + newHeight >
                        100
                      ) {
                        newHeight =
                          100 - start.y;
                      }

                      if (
                        newWidth < 10 ||
                        newHeight < 10
                      ) {
                        return;
                      }

                      setCropBox({
                        x: newX,
                        y: start.y,
                        width: newWidth,
                        height: newHeight,
                      });
                    }}
                    onPointerUp={() => {
                      cropResizeRef.current = null;
                    }}
                    onPointerCancel={() => {
                      cropResizeRef.current = null;
                    }}
                    style={{
                      position: "absolute",
                      left: "-9px",
                      bottom: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #111",
                      cursor: "nesw-resize",
                      zIndex: 30,
                      touchAction: "none",
                    }}
                  />

                  {/* =====================================
                      BOTTOM RIGHT
                  ===================================== */}

                  <div
                    data-resize="true"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      try {
                        event.currentTarget.setPointerCapture(
                          event.pointerId
                        );
                      } catch {
                        // Ignore
                      }

                      cropResizeRef.current = {
                        corner: "br",

                        pointerX: event.clientX,
                        pointerY: event.clientY,

                        startBox: {
                          ...cropBox,
                        },
                      };
                    }}
                    onPointerMove={(event) => {
                      const resize =
                        cropResizeRef.current;

                      if (
                        !resize ||
                        resize.corner !== "br"
                      ) {
                        return;
                      }

                      event.preventDefault();

                      const area =
                        cropAreaRef.current?.getBoundingClientRect();

                      if (
                        !area ||
                        !area.width ||
                        !area.height
                      ) {
                        return;
                      }

                      const dx =
                        ((event.clientX -
                          resize.pointerX) /
                          area.width) *
                        100;

                      const dy =
                        ((event.clientY -
                          resize.pointerY) /
                          area.height) *
                        100;

                      const start =
                        resize.startBox;

                      let newWidth =
                        start.width + dx;

                      let newHeight =
                        start.height + dy;

                      if (
                        start.x + newWidth >
                        100
                      ) {
                        newWidth =
                          100 - start.x;
                      }

                      if (
                        start.y + newHeight >
                        100
                      ) {
                        newHeight =
                          100 - start.y;
                      }

                      if (
                        newWidth < 10 ||
                        newHeight < 10
                      ) {
                        return;
                      }

                      setCropBox({
                        x: start.x,
                        y: start.y,
                        width: newWidth,
                        height: newHeight,
                      });
                    }}
                    onPointerUp={() => {
                      cropResizeRef.current = null;
                    }}
                    onPointerCancel={() => {
                      cropResizeRef.current = null;
                    }}
                    style={{
                      position: "absolute",
                      right: "-9px",
                      bottom: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #111",
                      cursor: "nwse-resize",
                      zIndex: 30,
                      touchAction: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* =====================================
                CROP BUTTONS
            ===================================== */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                className="upload-customer-button"
                onClick={applyCrop}
              >
                CROP & SAVE
              </button>

              <button
                type="button"
                onClick={cancelCrop}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          PHOTO VIEWER
      ================================================= */}

      {viewerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "min(850px, 100%)",
              maxHeight: "95vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                Register Photo
              </h2>

              <button
                type="button"
                onClick={closeViewer}
              >
                ✕
              </button>
            </div>

            <img
              src={viewerUrl}
              alt="Register"
              style={{
                width: "100%",
                maxHeight: "65vh",
                objectFit: "contain",
                background: "#f5f5f5",
                borderRadius: "10px",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "18px",
                flexWrap: "wrap",
              }}
            >
              {viewerDownloadUrl && (
                <button
                  type="button"
                  className="upload-customer-button"
                  onClick={() => {
                    window.location.href =
                      viewerDownloadUrl;
                  }}
                >
                  ⬇ DOWNLOAD PHOTO
                </button>
              )}

              <button
                type="button"
                onClick={closeViewer}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPhoto;