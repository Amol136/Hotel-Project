import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/forms.css";
import "../../styles/tables.css";

function CustomerId() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const frontCameraRef = useRef(null);
  const frontGalleryRef = useRef(null);
  const backCameraRef = useRef(null);
  const backGalleryRef = useRef(null);

  const cropImageRef = useRef(null);
  const videoRef = useRef(null);
const cameraStreamRef = useRef(null);

const [cameraOpen, setCameraOpen] = useState(false);
const [cameraSide, setCameraSide] = useState(null);
const [cameraError, setCameraError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);

  const [frontPhoto, setFrontPhoto] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);

  const [backPhoto, setBackPhoto] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [message, setMessage] = useState("");
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Search date.
  // Blank असल्यास records पूर्ण hide राहतील.
  const [searchDate, setSearchDate] = useState("");

  // Crop
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const [cropSide, setCropSide] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Photo viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerDownloadUrl, setViewerDownloadUrl] =
    useState("");
  const [viewerTitle, setViewerTitle] = useState("");

  // ==========================================
  // LOAD RECORDS
  // ==========================================

  useEffect(() => {
    const loadRecords = async () => {
      if (
        !user ||
        user.role !== "MANAGER" ||
        !user.id
      ) {
        return;
      }

      try {
        setLoadingRecords(true);

        const response = await apiFetch(
          `/api/customer-ids/manager/${user.id}`
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            errorText ||
              "Customer ID records मिळाले नाहीत."
          );
        }

        const data = await response.json();

        setRecords(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Customer ID records error:",
          error
        );

        setMessage(
          error.message ||
            "Customer ID records load करताना error आला."
        );
      } finally {
        setLoadingRecords(false);
      }
    };

    loadRecords();
  }, [user]);

  // ==========================================
  // ONLY LOGGED-IN MANAGER RECORDS
  // ==========================================

  const myRecords = records.filter(
    (record) =>
      Number(record.managerId) ===
      Number(user?.id)
  );

  // ==========================================
  // DATE SEARCH
  // No date = NO RECORDS
  // ==========================================

  const filteredRecords = searchDate
    ? myRecords.filter(
        (record) =>
          String(record.date || "") === searchDate
      )
    : [];
    // ==========================================
// LIVE CAMERA
// ==========================================

const stopCamera = () => {
  if (cameraStreamRef.current) {
    cameraStreamRef.current
      .getTracks()
      .forEach((track) => track.stop());

    cameraStreamRef.current = null;
  }

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }

  setCameraOpen(false);
  setCameraSide(null);
  setCameraError("");
};

const openCamera = async (side) => {
  try {
    setCameraError("");
    setMessage("");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      throw new Error(
        "या browser मध्ये Camera support उपलब्ध नाही."
      );
    }

    // जुना camera stream असेल तर बंद करा.
    if (cameraStreamRef.current) {
      cameraStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }

    const constraints = {
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
    };

    const stream =
      await navigator.mediaDevices.getUserMedia(
        constraints
      );

    cameraStreamRef.current = stream;

    setCameraSide(side);
    setCameraOpen(true);

    // Modal render होण्यासाठी थोडा वेळ.
    setTimeout(async () => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (error) {
          console.error(
            "Camera play error:",
            error
          );
        }
      }
    }, 100);
  } catch (error) {
    console.error(
      "Camera open error:",
      error
    );

    let errorMessage =
      "Camera सुरू करता आला नाही.";

    if (
      error.name === "NotAllowedError"
    ) {
      errorMessage =
        "Camera permission मिळाली नाही. Browser मध्ये Camera Allow करा.";
    }

    if (
      error.name === "NotFoundError"
    ) {
      errorMessage =
        "या device वर Camera सापडला नाही.";
    }

    if (
      error.name === "NotReadableError"
    ) {
      errorMessage =
        "Camera दुसऱ्या application मध्ये वापरला जात आहे.";
    }

    setCameraError(errorMessage);
    setMessage(errorMessage);
  }
};

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
      "Camera तयार होत आहे. पुन्हा Capture करा."
    );

    return;
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context =
    canvas.getContext("2d");

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

  const selectedSide =
    cameraSide;

  stopCamera();

  // Capture झाल्यावर थेट Crop screen.
  setCropSource(capturedImage);
  setCropSide(selectedSide);

  setZoom(1);
  setOffsetX(0);
  setOffsetY(0);

  setCropOpen(true);
  setMessage("");
};

// Component बंद झाल्यावर camera चालू राहू नये.
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

  // ==========================================
  // FILE SELECT -> OPEN CROP
  // ==========================================

  const handlePhoto = (event, side) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("कृपया फक्त फोटो निवडा.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCropSource(reader.result);
      setCropSide(side);

      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);

      setCropOpen(true);
      setMessage("");
    };

    reader.readAsDataURL(file);

    // Same photo पुन्हा select करता यावा.
    event.target.value = "";
  };

  // ==========================================
  // COMPRESS CANVAS
  // TARGET ~160 KB MAX
  // ==========================================

  const canvasToCompressedBlob = async (
    canvas,
    maxBytes = 160 * 1024
  ) => {
    let quality = 0.9;

    let blob = await new Promise((resolve) =>
      canvas.toBlob(
        resolve,
        "image/jpeg",
        quality
      )
    );

    while (
      blob &&
      blob.size > maxBytes &&
      quality > 0.3
    ) {
      quality -= 0.08;

      blob = await new Promise((resolve) =>
        canvas.toBlob(
          resolve,
          "image/jpeg",
          quality
        )
      );
    }

    // अजूनही मोठा असल्यास dimensions कमी करा.
    if (blob && blob.size > maxBytes) {
      const smallerCanvas =
        document.createElement("canvas");

      const scale = Math.sqrt(
        maxBytes / blob.size
      );

      smallerCanvas.width = Math.max(
        500,
        Math.floor(canvas.width * scale)
      );

      smallerCanvas.height = Math.max(
        300,
        Math.floor(canvas.height * scale)
      );

      const context =
        smallerCanvas.getContext("2d");

      context.drawImage(
        canvas,
        0,
        0,
        smallerCanvas.width,
        smallerCanvas.height
      );

      blob = await new Promise((resolve) =>
        smallerCanvas.toBlob(
          resolve,
          "image/jpeg",
          0.78
        )
      );
    }

    return blob;
  };

  // ==========================================
  // APPLY CROP
  // ==========================================

  const applyCrop = async () => {
    const image = cropImageRef.current;

    if (!image) {
      return;
    }

    try {
      setMessage("फोटो Crop आणि Compress होत आहे...");

      const canvas =
        document.createElement("canvas");

      // ID card friendly ratio
      const outputWidth = 1000;
      const outputHeight = 630;

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        outputWidth,
        outputHeight
      );

      const naturalWidth =
        image.naturalWidth;

      const naturalHeight =
        image.naturalHeight;

     const baseScale = Math.min(
  outputWidth / naturalWidth,
  outputHeight / naturalHeight
);

      const finalScale =
        baseScale * Number(zoom);

      const drawWidth =
        naturalWidth * finalScale;

      const drawHeight =
        naturalHeight * finalScale;

      const x =
        (outputWidth - drawWidth) / 2 +
        Number(offsetX);

      const y =
        (outputHeight - drawHeight) / 2 +
        Number(offsetY);

      context.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );

      const blob =
        await canvasToCompressedBlob(
          canvas,
          160 * 1024
        );

      if (!blob) {
        throw new Error(
          "फोटो तयार करता आला नाही."
        );
      }

      const fileName =
        cropSide === "front"
          ? `customer-id-front-${Date.now()}.jpg`
          : `customer-id-back-${Date.now()}.jpg`;

      const compressedFile = new File(
        [blob],
        fileName,
        {
          type: "image/jpeg",
        }
      );

      const previewUrl =
        URL.createObjectURL(
          compressedFile
        );

      if (cropSide === "front") {
        if (frontPreview) {
          URL.revokeObjectURL(
            frontPreview
          );
        }

        setFrontPhoto(
          compressedFile
        );

        setFrontPreview(
          previewUrl
        );
      }

      if (cropSide === "back") {
        if (backPreview) {
          URL.revokeObjectURL(
            backPreview
          );
        }

        setBackPhoto(
          compressedFile
        );

        setBackPreview(
          previewUrl
        );
      }

      setCropOpen(false);
      setCropSource("");
      setCropSide(null);

      setMessage(
        `फोटो तयार झाला (${Math.ceil(
          blob.size / 1024
        )} KB)`
      );
    } catch (error) {
      console.error(
        "Crop error:",
        error
      );

      setMessage(
        error.message ||
          "फोटो Crop करताना error आला."
      );
    }
  };

  // ==========================================
  // REMOVE PHOTOS
  // ==========================================

  const removeFrontPhoto = () => {
    if (frontPreview) {
      URL.revokeObjectURL(
        frontPreview
      );
    }

    setFrontPhoto(null);
    setFrontPreview(null);

    if (frontCameraRef.current) {
      frontCameraRef.current.value = "";
    }

    if (frontGalleryRef.current) {
      frontGalleryRef.current.value = "";
    }
  };

  const removeBackPhoto = () => {
    if (backPreview) {
      URL.revokeObjectURL(
        backPreview
      );
    }

    setBackPhoto(null);
    setBackPreview(null);

    if (backCameraRef.current) {
      backCameraRef.current.value = "";
    }

    if (backGalleryRef.current) {
      backGalleryRef.current.value = "";
    }
  };

  // ==========================================
  // UPLOAD
  // ==========================================

  const handleUpload = async (event) => {
    event.preventDefault();

    if (
      !user ||
      user.role !== "MANAGER" ||
      !user.id
    ) {
      setMessage(
        "Manager login माहिती मिळाली नाही. कृपया पुन्हा login करा."
      );

      return;
    }

    if (!date) {
      setMessage(
        "कृपया तारीख निवडा."
      );
      return;
    }

    if (!frontPhoto) {
      setMessage(
        "कृपया ID ची समोरील बाजू निवडा आणि Crop करा."
      );
      return;
    }

    if (!backPhoto) {
      setMessage(
        "कृपया ID ची मागील बाजू निवडा आणि Crop करा."
      );
      return;
    }

    try {
      setUploading(true);

      setMessage(
        "फोटो Upload होत आहेत..."
      );

      const formData =
        new FormData();

      formData.append(
        "managerId",
        user.id
      );

      formData.append(
        "date",
        date
      );

      formData.append(
        "frontPhoto",
        frontPhoto
      );

      formData.append(
        "backPhoto",
        backPhoto
      );

      const response =
        await apiFetch(
          "/api/customer-ids/upload",
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
            "Customer ID upload झाला नाही."
        );
      }

      const savedRecord =
        await response.json();

      setRecords(
        (previousRecords) => [
          savedRecord,
          ...previousRecords,
        ]
      );

      setMessage(
        "Customer ID फोटो यशस्वीरीत्या Upload झाले."
      );

      removeFrontPhoto();
      removeBackPhoto();
    } catch (error) {
      console.error(
        "Customer ID Upload Error:",
        error
      );

      setMessage(
        error.message ||
          "Customer ID फोटो Upload करताना error आला."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // PHOTO VIEWER
  // Photo + Download button
  // ==========================================

  const openPhotoViewer = async (
    record,
    side
  ) => {
    try {
      setMessage(
        "फोटो उघडत आहे..."
      );

      const viewEndpoint =
        side === "front"
          ? `/api/customer-ids/${record.id}/front-url`
          : `/api/customer-ids/${record.id}/back-url`;

      const downloadEndpoint =
        side === "front"
          ? `/api/customer-ids/${record.id}/front-download-url`
          : `/api/customer-ids/${record.id}/back-download-url`;

      const [
        viewResponse,
        downloadResponse,
      ] = await Promise.all([
        apiFetch(viewEndpoint),
        apiFetch(downloadEndpoint),
      ]);

      if (!viewResponse.ok) {
        throw new Error(
          side === "front"
            ? "Front Photo उघडता आला नाही."
            : "Back Photo उघडता आला नाही."
        );
      }

      if (!downloadResponse.ok) {
        throw new Error(
          "Download URL मिळाली नाही."
        );
      }

      const viewData =
        await viewResponse.json();

      const downloadData =
        await downloadResponse.json();

      if (!viewData.url) {
        throw new Error(
          "Photo URL मिळाली नाही."
        );
      }

      setViewerUrl(
        viewData.url
      );

      setViewerDownloadUrl(
        downloadData.url || ""
      );

      setViewerTitle(
        side === "front"
          ? "समोरील ID फोटो"
          : "मागील ID फोटो"
      );

      setViewerOpen(true);
      setMessage("");
    } catch (error) {
      console.error(
        "Photo viewer error:",
        error
      );

      setMessage(
        error.message ||
          "फोटो उघडता आला नाही."
      );
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl("");
    setViewerDownloadUrl("");
    setViewerTitle("");
  };

  return (
    <div className="customer-page">
      {/* HEADER */}

      <header className="customer-header">
        <div>
          <h2>
            Customer ID Management
          </h2>

          <p>
            ग्राहकाचे ID फोटो Crop,
            Compress आणि Upload करा
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
        {/* MANAGER INFO */}

        <section className="customer-manager-info">
          <div>
            <small>
              LOGGED IN MANAGER
            </small>

            <strong>
              {user?.name || "Manager"}
            </strong>
          </div>

          <div className="customer-manager-badges">
            <span>
              {user?.managerId || "-"}
            </span>

            <span>
              Sub Admin:{" "}
              {user?.subAdminId || "-"}
            </span>
          </div>
        </section>

        {/* UPLOAD */}

        <section className="customer-panel">
          <div className="panel-title">
            <div className="step-number">
              1
            </div>

            <div>
              <h2>
                ग्राहक ID फोटो अपलोड करा
              </h2>

              <p>
                Camera किंवा Gallery मधून
                फोटो निवडा, Crop करा आणि
                Upload करा.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload}>
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

            <div className="photo-section-title">
              <span className="step-number">
                2
              </span>

              <h3>
                फोटो अपलोड
              </h3>
            </div>

            <div className="photo-upload-grid">
              {/* FRONT */}

              <div className="photo-upload-card">
                <div className="photo-card-heading">
                  <h3>
                    समोरील बाजू
                  </h3>

                  <span
                    className={
                      frontPhoto
                        ? "photo-status selected"
                        : "photo-status"
                    }
                  >
                    {frontPhoto
                      ? `${Math.ceil(
                          frontPhoto.size /
                            1024
                        )} KB`
                      : "PENDING"}
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
                      onClick={
                        removeFrontPhoto
                      }
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <div className="placeholder-icon">
                      🪪
                    </div>

                    <p>
                      समोरील बाजूचा फोटो
                      निवडा
                    </p>
                  </div>
                )}

                <div className="photo-buttons">
                  <button
  type="button"
  className="camera-button"
  onClick={() =>
    openCamera("front")
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

                {/* CAMERA */}

                <input
                  ref={frontCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(event) =>
                    handlePhoto(
                      event,
                      "front"
                    )
                  }
                />

                {/* GALLERY */}

                <input
                  ref={frontGalleryRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) =>
                    handlePhoto(
                      event,
                      "front"
                    )
                  }
                />
              </div>

              {/* BACK */}

              <div className="photo-upload-card">
                <div className="photo-card-heading">
                  <h3>
                    मागील बाजू
                  </h3>

                  <span
                    className={
                      backPhoto
                        ? "photo-status selected"
                        : "photo-status"
                    }
                  >
                    {backPhoto
                      ? `${Math.ceil(
                          backPhoto.size /
                            1024
                        )} KB`
                      : "PENDING"}
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
                      onClick={
                        removeBackPhoto
                      }
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <div className="placeholder-icon">
                      🪪
                    </div>

                    <p>
                      मागील बाजूचा फोटो
                      निवडा
                    </p>
                  </div>
                )}

                <div className="photo-buttons">
                  <button
  type="button"
  className="camera-button"
  onClick={() =>
    openCamera("back")
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
                    handlePhoto(
                      event,
                      "back"
                    )
                  }
                />

                <input
                  ref={backGalleryRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) =>
                    handlePhoto(
                      event,
                      "back"
                    )
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
              disabled={uploading}
            >
              {uploading
                ? "फोटो UPLOAD होत आहेत..."
                : "फोटो UPLOAD करा"}
            </button>
          </form>
        </section>

        {/* =====================================
            ग्राहक नोंद तपासणी
            DATE SEARCH केल्यावरच records
        ===================================== */}

        <section className="records-panel">
          <div className="records-heading">
            <div>
              <h2>
                ग्राहक नोंद तपासणी
              </h2>

              <p>
                तारीख निवडल्यानंतरच त्या
                दिवसाचे records दिसतील.
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

          {/* DATE SELECT केलेली नाही */}

          {!searchDate ? (
            <div className="customer-empty-records">
              <div>🔎</div>

              <h3>
                तारीख निवडा
              </h3>

              <p>
                Record पाहण्यासाठी वरून
                तारीख Search करा.
              </p>
            </div>
          ) : loadingRecords ? (
            <div className="customer-empty-records">
              <div>⏳</div>

              <h3>
                Records Loading...
              </h3>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="customer-empty-records">
              <div>🪪</div>

              <h3>
                या तारखेचा Record नाही
              </h3>

              <p>
                निवडलेल्या तारखेला कोणताही
                Customer ID record सापडला नाही.
              </p>
            </div>
          ) : (
            <div className="records-table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>SR.</th>
                    <th>DATE</th>
                    <th>FRONT PHOTO</th>
                    <th>BACK PHOTO</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map(
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
                            type="button"
                            className="view-front-button"
                            onClick={() =>
                              openPhotoViewer(
                                record,
                                "front"
                              )
                            }
                          >
                            फोटो पहा
                          </button>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="view-back-button"
                            onClick={() =>
                              openPhotoViewer(
                                record,
                                "back"
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
      {/* =====================================
    LIVE CAMERA MODAL
===================================== */}

{cameraOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.92)",
      zIndex: 11000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "15px",
    }}
  >
    <div
      style={{
        width: "min(760px, 100%)",
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
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          {cameraSide === "front"
            ? "समोरील बाजूचा फोटो"
            : "मागील बाजूचा फोटो"}
        </h2>

        <button
          type="button"
          onClick={stopCamera}
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
          justifyContent: "center",
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
          onClick={stopCamera}
        >
          CANCEL
        </button>
      </div>
    </div>
  </div>
)}

      {/* =====================================
          CROP MODAL
      ===================================== */}

      {cropOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.78)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "min(700px, 100%)",
              maxHeight: "95vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <h2>
              फोटो Crop करा
            </h2>

            <p>
              फोटो योग्य जागी बसवण्यासाठी
              Zoom आणि Position बदला.
            </p>

            <div
              style={{
                width: "100%",
                aspectRatio: "1000 / 630",
                overflow: "hidden",
                background: "#111",
                borderRadius: "12px",
                position: "relative",
              }}
            >
              <img
  ref={cropImageRef}
  src={cropSource}
  alt="Crop"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
    transformOrigin: "center center",
    display: "block",
  }}
/>
            </div>

            <div
              style={{
                marginTop: "18px",
              }}
            >
              <label>
                Zoom
              </label>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(event) =>
                  setZoom(
                    Number(
                      event.target.value
                    )
                  )
                }
                style={{
                  width: "100%",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "12px",
              }}
            >
              <label>
                Left / Right
              </label>

              <input
                type="range"
                min="-250"
                max="250"
                value={offsetX}
                onChange={(event) =>
                  setOffsetX(
                    Number(
                      event.target.value
                    )
                  )
                }
                style={{
                  width: "100%",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "12px",
              }}
            >
              <label>
                Up / Down
              </label>

              <input
                type="range"
                min="-250"
                max="250"
                value={offsetY}
                onChange={(event) =>
                  setOffsetY(
                    Number(
                      event.target.value
                    )
                  )
                }
                style={{
                  width: "100%",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
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
                onClick={() => {
                  setCropOpen(false);
                  setCropSource("");
                  setCropSide(null);
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          PHOTO VIEWER MODAL
      ===================================== */}

      {viewerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.85)",
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
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <h2>
                {viewerTitle}
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
              alt={viewerTitle}
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

export default CustomerId;