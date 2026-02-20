import { useState } from "react";
import Navbar from "../components/Navbar";
import StepInfo from "../components/StepInfo";
import UploadCard from "../components/UploadCard";
import { detectMood, getMoodMusic } from "../lib/api";

export default function DetectMood() {
  const [faceFile, setFaceFile] = useState(null);
  const [eegFiles, setEegFiles] = useState([]);
  const ready = faceFile && eegFiles.length;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!faceFile || !eegFiles.length) {
      setError("Please provide a face image and EEG file.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    // Pre-open a blank tab synchronously (user-gesture context) so the
    // browser won't block it after the async call resolves.
    let popup = null;
    if (autoOpen) {
      try {
        popup = window.open("about:blank", "_blank");
      } catch (e) {
        popup = null;
      }
    }
    try {
      const fd = new FormData();
      fd.append("image", faceFile);
      if (eegFiles[0]) fd.append("eeg", eegFiles[0]);
      const data = await detectMood(fd);
      setResult(data);
      // Auto-open: navigate pre-opened tab to YouTube
      try {
        const openUrl = data?.music_link || (data?.music_options && data.music_options[0]?.url);
        if (autoOpen && openUrl) {
          const ytMatch = openUrl.match(/[?&]v=([^&]+)/) || openUrl.match(/youtu\.be\/(.+)$/);
          const vid = ytMatch ? ytMatch[1] : null;
          if (vid) {
            setSelectedVideo(vid);
            if (popup && !popup.closed) popup.location.href = `https://www.youtube.com/watch?v=${vid}`;
            else window.open(`https://www.youtube.com/watch?v=${vid}`, "_blank");
          } else {
            if (popup && !popup.closed) popup.location.href = openUrl;
            else window.open(openUrl, "_blank");
          }
        } else if (popup && !popup.closed) {
          popup.close(); // no URL to navigate — close the blank tab
        }
      } catch (e) {
        // ignore popup errors
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    let popup = null;
    if (autoOpen) {
      try {
        popup = window.open("about:blank", "_blank");
      } catch (e) {
        popup = null;
      }
    }
    try {
      setPreviewLoading(true);
      const data = await getMoodMusic("happy");
      const previewResult = {
        face_emotion: "preview",
        eeg_emotion: "preview",
        final_mood: "Happy",
        music_options: data.tracks,
      };
      setResult(previewResult);

      // Auto-open first preview track if enabled
      try {
        const openUrl = data?.tracks && data.tracks[0]?.url;
        if (autoOpen && openUrl) {
          const ytMatch = openUrl.match(/[?&]v=([^&]+)/) || openUrl.match(/youtu\.be\/(.+)$/);
          const vid = ytMatch ? ytMatch[1] : null;
          if (vid) {
            setSelectedVideo(vid);
            if (popup && !popup.closed) popup.location.href = `https://www.youtube.com/watch?v=${vid}`;
            else window.open(`https://www.youtube.com/watch?v=${vid}`, "_blank");
          } else {
            if (popup && !popup.closed) popup.location.href = openUrl;
            else window.open(openUrl, "_blank");
          }
        } else if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) {}
    } catch (err) {
      setError(err.message || "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleReset = () => {
    setFaceFile(null);
    setEegFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">AI-Powered Mood Detection</div>
          <h1 className="hero-title">
            Detect Your Mood with{" "}
            <span className="gradient-text">Face + Brain Signals</span>
          </h1>
          <p className="hero-subtitle">
            Upload a face image and EEG data — we'll analyze your emotions and
            recommend the perfect music for your mood.
          </p>
        </section>

        {/* Steps */}
        <StepInfo />

        {/* Upload */}
        <section className="upload-section">
          <div className="upload-grid">
            <UploadCard
              title="EEG Brain Signals"
              description="Upload CSV from your EEG headband"
              accept=".csv"
              multiple={false}
              variant="eeg"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="upload-card-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l2-6 3 12 2-6 3 6h3" />
                </svg>
              }
              onFileSelect={(arr) => setEegFiles(arr || [])}
            />
            <UploadCard
              title="Face Image"
              description="Upload a clear front-facing photo"
              accept=".jpg,.jpeg,.png"
              multiple={false}
              variant="face"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="upload-card-icon">
                  <circle cx="12" cy="8" r="5" />
                  <path strokeLinecap="round" d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              }
              onFileSelect={(arr) => setFaceFile(arr && arr[0])}
            />
          </div>
        </section>

        {/* Actions */}
        <section className="actions">
          <button
            onClick={handleAnalyze}
            disabled={!ready || loading}
            className={`action-btn primary ${!ready ? "disabled" : ""}`}
          >
            {loading ? (
              <><span className="spinner" /> Analyzing...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="btn-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Analyze Mood
              </>
            )}
          </button>
          <button onClick={handlePreview} disabled={previewLoading} className="action-btn secondary">
            {previewLoading ? "Loading..." : "Preview Songs"}
          </button>
          <button onClick={handleReset} className="action-btn ghost">Reset</button>
          <div className="auto-open-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
              <input type="checkbox" checked={autoOpen} onChange={(e) => setAutoOpen(e.target.checked)} />
              <span>Open top suggestion on YouTube after analysis</span>
            </label>
          </div>
        </section>

        {/* Results */}
        <section className="results-section">
          {loading && (
            <div className="status-banner loading">
              <span className="spinner" /> Analyzing your mood — please wait...
            </div>
          )}

          {error && (
            <div className="status-banner error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="banner-icon">
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
              </svg>
              {error}
            </div>
          )}

          {result && (
            <div className="result-card fade-in-up">
              <div className="mood-summary">
                <div className="mood-emoji">
                  {result.final_mood === "Happy" ? "😊" : result.final_mood === "Sad" ? "😢" : result.final_mood === "Angry" ? "😡" : result.final_mood === "Fear" ? "😨" : "😐"}
                </div>
                <div className="mood-info">
                  <div className="mood-label">Detected Mood</div>
                  <div className="mood-value gradient-text">{result.final_mood}</div>
                </div>
                <div className="mood-details">
                  <div className="detail-chip">
                    <span className="detail-label">Face</span>
                    <span className="detail-value">{result.face_emotion}</span>
                  </div>
                  <div className="detail-chip">
                    <span className="detail-label">EEG</span>
                    <span className="detail-value">{result.eeg_emotion}</span>
                  </div>
                </div>
              </div>

              {result.music_options && Array.isArray(result.music_options) && (
                <div className="music-section">
                  <h3 className="music-heading">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="heading-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                    </svg>
                    Recommended for You
                  </h3>

                  <div className="music-cards">
                    {result.music_options.map((t, i) => {
                      const url = t.url || "";
                      const ytMatch = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/(.+)$/);
                      const vid = ytMatch ? ytMatch[1] : null;
                      const thumb = vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : null;

                      return (
                        <a key={i} href={t.url} target="_blank" rel="noreferrer" className="song-card">
                          <div className="song-thumb">
                            {thumb ? (
                              <img src={thumb} alt={t.name} loading="lazy" />
                            ) : (
                              <div className="song-thumb-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13" /></svg>
                              </div>
                            )}
                            <div className="play-icon">▶</div>
                          </div>
                          <div className="song-info">
                            <div className="song-name">{t.name}</div>
                            <div className="song-meta">
                              {t.channel || "YouTube"}
                              {t.duration && <span> · {t.duration}</span>}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>

                  {selectedVideo && (
                    <div className="embed-player">
                      <iframe
                        title="music-player"
                        width="100%"
                        height="300"
                        src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&mute=1`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                      <button onClick={() => setSelectedVideo(null)} className="action-btn ghost" style={{ marginTop: 8 }}>
                        Close Player
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">© {new Date().getFullYear()} MoodMusic</span>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
