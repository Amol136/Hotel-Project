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
  const cropAreaRef = useRef(null);

  // Crop box move / resize refs
  const cropDragRef = useRef(null);
  const cropResizeRef = useRef(null);

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

  const [searchDate, setSearchDate] = useState("");

  // ==========================================
  // CROP
  // ==========================================

  const [cropOpen, setCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const [cropSide, setCropSide] = useState(null);

  // Percentage based crop box.
  // Full image remains visible.
  const [cropBox, setCropBox] = useState({
    x: 10,
    y: 15,
    width: 80,
    height: 60,
  });

  // Photo viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerDownloadUrl, setViewerDownloadUrl] =
    useState("");
  const [viewerTitle, setViewerTitle] = useState("");

  // ==========================================
  // RESET CROP
  // ==========================================

  const resetCropBox = () => {
    setCropBox({
      x: 10,
      y: 15,
      width: 80,
      height: 60,
    });

    cropDragRef.current = null;
    cropResizeRef.current = null;
  };

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

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera permission मिळाली नाही. Browser मध्ये Camera Allow करा.";
      }

      if (error.name === "NotFoundError") {
        errorMessage =
          "या device वर Camera सापडला नाही.";
      }

      if (error.name === "NotReadableError") {
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

    const selectedSide = cameraSide;

    stopCamera();

    setCropSource(capturedImage);
    setCropSide(selectedSide);

    resetCropBox();

    setCropOpen(true);
    setMessage("");
  };

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
      setMessage(
        "कृपया फक्त फोटो निवडा."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCropSource(reader.result);
      setCropSide(side);

      resetCropBox();

      setCropOpen(true);
      setMessage("");
    };

    reader.readAsDataURL(file);

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
  // Only selected crop-box area is saved
  // ==========================================

  const applyCrop = async () => {
    const image = cropImageRef.current;

    if (!image) {
      return;
    }

    try {
      setMessage(
        "फोटो Crop आणि Compress होत आहे..."
      );

      if (
        !image.naturalWidth ||
        !image.naturalHeight
      ) {
        throw new Error(
          "फोटो पूर्ण load झाला नाही."
        );
      }

      /*
       * cropBox percentage मध्ये आहे.
       * त्यामुळे displayed image च्या percentage
       * ला थेट natural image pixels मध्ये convert
       * करता येते.
       */

      const sourceX =
        (cropBox.x / 100) *
        image.naturalWidth;

      const sourceY =
        (cropBox.y / 100) *
        image.naturalHeight;

      const sourceWidth =
        (cropBox.width / 100) *
        image.naturalWidth;

      const sourceHeight =
        (cropBox.height / 100) *
        image.naturalHeight;

      if (
        sourceWidth <= 0 ||
        sourceHeight <= 0
      ) {
        throw new Error(
          "Crop area योग्य नाही."
        );
      }

      /*
       * Crop box free resize आहे.
       * त्यामुळे फोटो stretch होऊ नये म्हणून
       * crop चाच aspect ratio preserve करतो.
       */

      const maxOutputWidth = 1000;
      const maxOutputHeight = 1000;

      let outputWidth = Math.round(
        sourceWidth
      );

      let outputHeight = Math.round(
        sourceHeight
      );

      const outputScale = Math.min(
        1,
        maxOutputWidth / outputWidth,
        maxOutputHeight / outputHeight
      );

      outputWidth = Math.max(
        1,
        Math.round(
          outputWidth * outputScale
        )
      );

      outputHeight = Math.max(
        1,
        Math.round(
          outputHeight * outputScale
        )
      );

      const canvas =
        document.createElement("canvas");

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "फोटो तयार करता आला नाही."
        );
      }

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

      const compressedFile =
        new File(
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

      resetCropBox();

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

        {/* =====================================
            UPLOAD SECTION
        ===================================== */}

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

              {/* =====================================
                  FRONT PHOTO
              ===================================== */}

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
                      ✕
                    </button>

                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <span>
                      📷
                    </span>

                    <p>
                      समोरील फोटो निवडा
                    </p>
                  </div>
                )}

                <div className="photo-action-buttons">

                  <button
                    type="button"
                    onClick={() =>
                      openCamera("front")
                    }
                  >
                    📷 CAMERA
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      frontGalleryRef.current?.click()
                    }
                  >
                    🖼 GALLERY
                  </button>

                </div>

                <input
                  ref={frontCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{
                    display: "none",
                  }}
                  onChange={(event) =>
                    handlePhoto(
                      event,
                      "front"
                    )
                  }
                />

                <input
                  ref={frontGalleryRef}
                  type="file"
                  accept="image/*"
                  style={{
                    display: "none",
                  }}
                  onChange={(event) =>
                    handlePhoto(
                      event,
                      "front"
                    )
                  }
                />

              </div>

              {/* =====================================
                  BACK PHOTO
              ===================================== */}

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
                      ✕
                    </button>

                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <span>
                      📷
                    </span>

                    <p>
                      मागील फोटो निवडा
                    </p>
                  </div>
                )}

                <div className="photo-action-buttons">

                  <button
                    type="button"
                    onClick={() =>
                      openCamera("back")
                    }
                  >
                    📷 CAMERA
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      backGalleryRef.current?.click()
                    }
                  >
                    🖼 GALLERY
                  </button>

                </div>

                <input
                  ref={backCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{
                    display: "none",
                  }}
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
                  style={{
                    display: "none",
                  }}
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
                ? "UPLOADING..."
                : "UPLOAD CUSTOMER ID"}
            </button>

          </form>
        </section>

        {/* =====================================
            RECORDS
        ===================================== */}

        <section className="customer-panel">

          <div className="panel-title">
            <div className="step-number">
              3
            </div>

            <div>
              <h2>
                Customer ID Records
              </h2>

              <p>
                तारीख निवडून अपलोड केलेले
                फोटो पहा.
              </p>
            </div>
          </div>

          <div className="customer-form-group">
            <label>
              तारीख शोधा
            </label>

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

          {loadingRecords ? (
            <div className="customer-message">
              Records load होत आहेत...
            </div>
          ) : !searchDate ? (
            <div className="customer-message">
              Records पाहण्यासाठी तारीख निवडा.
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="customer-message">
              या तारखेला कोणतेही records नाहीत.
            </div>
          ) : (
            <div className="customer-table-wrapper">

              <table className="customer-table">
                <thead>
                  <tr>
                    <th>
                      ID
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Front Photo
                    </th>

                    <th>
                      Back Photo
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map(
                    (record) => (
                      <tr key={record.id}>

                        <td>
                          {record.id}
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
            background:
              "rgba(0,0,0,0.92)",
            zIndex: 11000,
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
                onClick={stopCamera}
              >
                CANCEL
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================
          CROP MODAL START
          PART 3 CONTINUES FROM HERE
      ===================================== */}
            {cropOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            zIndex: 9999,
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
              फोटो Crop करा
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
                IMAGE + CROP BOX
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
                  alt="Crop"
                  draggable="false"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    width: "auto",
                    height: "auto",
                    maxHeight: "65vh",
                    objectFit: "contain",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />

                {/* =====================================
                    CROP SELECTION BOX
                ===================================== */}

                <div
                  style={{
                    position: "absolute",
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                    border: "2px solid #ffffff",
                    boxSizing: "border-box",
                    cursor: "move",
                    touchAction: "none",
                    zIndex: 10,
                    boxShadow:
                      "0 0 0 9999px rgba(0,0,0,0.48)",
                  }}

                  // ==================================
                  // MOVE CROP BOX
                  // ==================================

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
                      pointerX:
                        event.clientX,

                      pointerY:
                        event.clientY,

                      startX:
                        cropBox.x,

                      startY:
                        cropBox.y,

                      width:
                        cropBox.width,

                      height:
                        cropBox.height,
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

                    setCropBox(
                      (previous) => ({
                        ...previous,
                        x: newX,
                        y: newY,
                      })
                    );
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
                  {/* =================================
                      3 x 3 GRID
                  ================================= */}

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

                  {/* =================================
                      TOP LEFT HANDLE
                  ================================= */}

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
                        pointerX:
                          event.clientX,
                        pointerY:
                          event.clientY,
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
                      cropResizeRef.current =
                        null;
                    }}

                    onPointerCancel={() => {
                      cropResizeRef.current =
                        null;
                    }}

                    style={{
                      position: "absolute",
                      left: "-9px",
                      top: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border:
                        "2px solid #111",
                      cursor:
                        "nwse-resize",
                      zIndex: 30,
                      touchAction: "none",
                    }}
                  />

                  {/* =================================
                      TOP RIGHT HANDLE
                  ================================= */}

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
                        pointerX:
                          event.clientX,
                        pointerY:
                          event.clientY,
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
                        start.x +
                          newWidth >
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
                      cropResizeRef.current =
                        null;
                    }}

                    onPointerCancel={() => {
                      cropResizeRef.current =
                        null;
                    }}

                    style={{
                      position: "absolute",
                      right: "-9px",
                      top: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border:
                        "2px solid #111",
                      cursor:
                        "nesw-resize",
                      zIndex: 30,
                      touchAction: "none",
                    }}
                  />

                  {/* =================================
                      BOTTOM LEFT HANDLE
                  ================================= */}

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
                        pointerX:
                          event.clientX,
                        pointerY:
                          event.clientY,
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
                        start.y +
                          newHeight >
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
                      cropResizeRef.current =
                        null;
                    }}

                    onPointerCancel={() => {
                      cropResizeRef.current =
                        null;
                    }}

                    style={{
                      position: "absolute",
                      left: "-9px",
                      bottom: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border:
                        "2px solid #111",
                      cursor:
                        "nesw-resize",
                      zIndex: 30,
                      touchAction: "none",
                    }}
                  />

                  {/* =================================
                      BOTTOM RIGHT HANDLE
                  ================================= */}

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
                        pointerX:
                          event.clientX,
                        pointerY:
                          event.clientY,
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
                        start.x +
                          newWidth >
                        100
                      ) {
                        newWidth =
                          100 - start.x;
                      }

                      if (
                        start.y +
                          newHeight >
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
                      cropResizeRef.current =
                        null;
                    }}

                    onPointerCancel={() => {
                      cropResizeRef.current =
                        null;
                    }}

                    style={{
                      position: "absolute",
                      right: "-9px",
                      bottom: "-9px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border:
                        "2px solid #111",
                      cursor:
                        "nwse-resize",
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
                marginTop: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
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

                  resetCropBox();
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
              width:
                "min(850px, 100%)",
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

export default CustomerId;