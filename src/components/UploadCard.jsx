import { useState, useCallback, useRef, useEffect } from "react";

export default function UploadCard({
  title = "Upload File",
  description = "Supported formats",
  onFileSelect = () => {},
  accept = ".csv",
  multiple = false,
  maxSize = 50 * 1024 * 1024,
  variant = null,
  icon = null,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const inputRef = useRef(null);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFile = useCallback(
    (fList) => {
      if (!fList) return;
      const arr = multiple ? Array.from(fList) : [fList[0]];
      setFiles(arr);
      onFileSelect(arr);
    },
    [onFileSelect, multiple]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    if (e.target.files?.length) handleFile(e.target.files);
  };

  const removeFile = (idx) => {
    const copy = [...files];
    copy.splice(idx, 1);
    setFiles(copy);
    onFileSelect(copy);
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0, size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(1)} ${units[i]}`;
  };

  // Camera
  const startCamera = async () => {
    setStatus("");
    setCameraOpen(true);          // render the modal first so videoRef exists
  };

  // Once the modal is rendered (cameraOpen flips to true), acquire the stream
  useEffect(() => {
    if (!cameraOpen) return;

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (cancelled) {                       // user closed before stream arrived
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch (_) { /* autoPlay handles it */ }
        }
        setStreamReady(true);
      } catch (err) {
        console.error("Camera error", err);
        setCameraOpen(false);
        if (err?.name === "NotAllowedError") {
          setStatus("Camera access was denied. Please allow camera permission in your browser settings.");
        } else if (err?.name === "NotFoundError") {
          setStatus("No camera device found. Please connect a camera and try again.");
        } else if (err?.name === "NotReadableError") {
          setStatus("Cannot access the camera. It may be in use by another application.");
        } else {
          setStatus("Unable to access camera. Check browser permissions and try again.");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [cameraOpen]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreamReady(false);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const v = videoRef.current;
    if (!v) {
      setStatus('Camera not initialized');
      return;
    }
    // ensure video has dimensions
    if (!v.videoWidth || !v.videoHeight) {
      setStatus('Camera image not ready yet — try again');
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      setFiles([file]);
      onFileSelect([file]);
      setStatus('Photo captured');
      stopCamera();
    }, "image/jpeg", 0.95);
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className={`upload-card ${isDragOver ? "drag-over" : ""}`}>
      {/* Header */}
      <div className="upload-card-header">
        <div className={`upload-card-icon-wrap ${variant || ""}`}>
          {icon || (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="upload-card-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l-3-3m3 3 3-3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            </svg>
          )}
        </div>
        <div>
          <div className="upload-card-title">{title}</div>
          <div className="upload-card-desc">{description}</div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="drop-zone-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13" />
        </svg>
        <div className="drop-zone-text">
          {files.length ? files[0].name : "Drag & drop or click to browse"}
        </div>
        <div className="drop-zone-hint">
          {files.length ? formatSize(files[0].size) : `Accepts ${accept}`}
        </div>
      </div>

      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" multiple={multiple} />

      {/* File info + buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button onClick={() => inputRef.current?.click()} className="browse-btn" type="button">
          Browse files
        </button>
        {variant === "face" && (
          <button onClick={startCamera} className="camera-btn" type="button">
            Use camera
          </button>
        )}
        {files.length > 0 && (
          <div className="file-chip">
            <span className="file-name">{files[0].name}</span>
            <span className="file-size">{formatSize(files[0].size)}</span>
            <span className="file-remove" onClick={() => removeFile(0)}>✕</span>
          </div>
        )}
      </div>

      {/* status (errors / info) */}
      {status && (
        <div style={{ marginTop: 12, color: '#b91c1c', fontSize: 13 }}>{status}</div>
      )}

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <video ref={videoRef} autoPlay muted playsInline style={{ display: streamReady ? "block" : "none" }} />
            {!streamReady && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: 15 }}>
                <span className="spinner" style={{ marginRight: 8 }} />Starting camera…
              </div>
            )}
            <div className="controls">
              <button onClick={capturePhoto} className="browse-btn" disabled={!streamReady}>Capture</button>
              <button onClick={stopCamera} className="camera-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
