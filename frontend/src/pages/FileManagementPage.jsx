import { useState, useEffect } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  File,
  Loader2,
  Film,
  FileText,
  Image as ImageIcon,
  Archive,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { uploadFile } from "../features/file_management/fileService.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const FILE_CATEGORIES = [
  {
    type: "video",
    label: "Video Lesson",
    icon: Film,
    maxSizeMB: 500,
    extensions: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    accept: ".mp4,.mov,.avi,.mkv,.webm,video/*",
    badgeColor: "var(--info)",
    badgeBg: "var(--info-light)",
    description: "MP4, MOV, AVI, MKV, WEBM (Max 500MB)",
  },
  {
    type: "pdf",
    label: "PDF Document",
    icon: FileText,
    maxSizeMB: 25,
    extensions: [".pdf"],
    accept: ".pdf,application/pdf",
    badgeColor: "var(--danger)",
    badgeBg: "var(--danger-light)",
    description: "PDF course syllabus & guides (Max 25MB)",
  },
  {
    type: "image",
    label: "Image Asset",
    icon: ImageIcon,
    maxSizeMB: 10,
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    accept: ".jpg,.jpeg,.png,.gif,.webp,image/*",
    badgeColor: "var(--primary)",
    badgeBg: "var(--primary-light)",
    description: "PNG, JPG, WEBP, GIF thumbnails (Max 10MB)",
  },
  {
    type: "zip",
    label: "ZIP Archive",
    icon: Archive,
    maxSizeMB: 100,
    extensions: [".zip"],
    accept: ".zip,application/zip,application/x-zip-compressed",
    badgeColor: "var(--purple)",
    badgeBg: "var(--purple-light)",
    description: "ZIP project starter kits & bundles (Max 100MB)",
  },
];

function detectFileType(file) {
  if (!file || !file.name) return null;
  const name = file.name.toLowerCase();
  for (const cat of FILE_CATEGORIES) {
    if (cat.extensions.some((ext) => name.endsWith(ext))) {
      return cat.type;
    }
  }
  return null;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const STORAGE_KEY = "lms_uploaded_assets";

export function FileManagementPage() {
  const { access } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("auto");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedResult, setUploadedResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const detectedType = selectedFile ? detectFileType(selectedFile) : null;
  const effectiveType = selectedCategory !== "auto" ? selectedCategory : detectedType;
  const activeRule = FILE_CATEGORIES.find((c) => c.type === effectiveType);

  // Validate size & extension whenever file or category changes
  const validationWarning = (() => {
    if (!selectedFile) return null;
    if (!effectiveType) {
      return "Unsupported file extension. Allowed formats: MP4, MOV, WEBM, PDF, JPG, PNG, WEBP, GIF, and ZIP.";
    }
    if (activeRule && selectedFile.size > activeRule.maxSizeMB * 1024 * 1024) {
      return `File size (${formatBytes(selectedFile.size)}) exceeds the maximum allowed limit of ${activeRule.maxSizeMB}MB for ${activeRule.label}s.`;
    }
    return null;
  })();

  function handleFileSelection(file) {
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setUploadedResult(null);

    const autoDetected = detectFileType(file);
    if (autoDetected) {
      setSelectedCategory(autoDetected);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }

  async function handleCopy(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  }

  function removeHistoryItem(id) {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return;

    if (validationWarning) {
      setError(validationWarning);
      return;
    }

    const typeToSubmit = effectiveType || "pdf";

    setUploading(true);
    setError(null);
    setUploadedResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("file_type", typeToSubmit);

    try {
      const result = await uploadFile(formData, access);
      const fullUrl = getMediaUrl(result.url || result.path);

      const record = {
        id: Date.now().toString(),
        fileName: result.file_name || selectedFile.name,
        fileType: result.file_type || typeToSubmit,
        size: result.size || selectedFile.size,
        url: fullUrl,
        rawUrl: result.url,
        createdAt: new Date().toISOString(),
      };

      setUploadedResult(record);
      setSelectedFile(null);
      setSelectedCategory("auto");

      // Save to history
      const newHistory = [record, ...history].slice(0, 20);
      setHistory(newHistory);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch {}
    } catch (err) {
      const msg = err.message || "Failed to upload file. Please check file format and permissions.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em" }}>File Asset Manager</h1>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: "var(--primary-light)",
              color: "var(--primary)",
              border: "1px solid var(--primary-border)",
            }}
          >
            Direct Storage
          </span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Upload media, documents, and learning assets. Assets are securely stored with persistent URLs for your courses and lessons.
        </p>
      </div>

      {/* Rules Overview Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.85rem",
        }}
      >
        {FILE_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = effectiveType === cat.type;
          return (
            <div
              key={cat.type}
              onClick={() => setSelectedCategory(cat.type)}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "var(--radius-md)",
                background: isSelected ? "var(--primary-light)" : "var(--bg-surface)",
                border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--border-color)",
                boxShadow: isSelected ? "0 0 0 2px var(--accent-glow)" : "none",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  background: cat.badgeBg,
                  color: cat.badgeColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconComponent size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-900)" }}>{cat.label}</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>≤ {cat.maxSizeMB}MB</span>
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.15rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {cat.extensions.join(", ")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Upload Card */}
      <form onSubmit={handleUpload} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UploadCloud size={20} style={{ color: "var(--primary)" }} />
            <span>Upload New Asset</span>
          </h3>

          {/* Type Selector Dropdown / Auto indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Target Type:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.82rem", width: "auto" }}
            >
              <option value="auto">Auto-detect ({detectedType || "none"})</option>
              {FILE_CATEGORIES.map((c) => (
                <option key={c.type} value={c.type}>
                  {c.label} ({c.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              background: "var(--danger-light)",
              color: "var(--danger)",
              border: "1px solid var(--danger-border)",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Local Validation Warning */}
        {validationWarning && !error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              background: "var(--warning-light)",
              color: "var(--warning-hover)",
              border: "1px solid var(--warning-border)",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            <Info size={18} style={{ flexShrink: 0 }} />
            <span>{validationWarning}</span>
          </div>
        )}

        {/* Drag & Drop File Selector Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-asset-input")?.click()}
          style={{
            border: isDragging
              ? "2px dashed var(--primary)"
              : selectedFile
              ? "2px solid var(--primary-border)"
              : "2px dashed var(--slate-300)",
            borderRadius: "var(--radius-lg)",
            padding: "2.5rem 1.5rem",
            textAlign: "center",
            background: isDragging
              ? "var(--primary-light)"
              : selectedFile
              ? "var(--slate-50)"
              : "var(--slate-50)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.85rem",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: selectedFile ? "var(--primary-light)" : "var(--slate-200)",
              color: selectedFile ? "var(--primary)" : "var(--slate-700)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease",
            }}
          >
            {selectedFile ? <File size={28} /> : <UploadCloud size={28} />}
          </div>

          <div>
            {selectedFile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center" }}>
                <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--slate-900)" }}>{selectedFile.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span
                    style={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: effectiveType ? "var(--primary)" : "var(--danger)",
                    }}
                  >
                    Type: {effectiveType || "Unknown"}
                  </span>
                  <span>•</span>
                  <span style={{ textDecoration: "underline", color: "var(--primary)" }}>Click or drag to replace</span>
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--slate-900)" }}>
                  {isDragging ? "Drop your file here..." : "Choose a file or drag & drop"}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Supports Video (MP4, MKV), PDF documents, Images (PNG, JPG, WEBP), and ZIP files
                </p>
              </>
            )}
          </div>

          <input
            id="file-asset-input"
            type="file"
            onChange={(e) => handleFileSelection(e.target.files[0] || null)}
            style={{ display: "none" }}
            accept={activeRule ? activeRule.accept : undefined}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {selectedFile && (
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setSelectedCategory("auto");
                setError(null);
              }}
              className="btn btn-outline"
              style={{ padding: "0.65rem 1rem", fontSize: "0.9rem" }}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={uploading || !selectedFile || !!validationWarning}
            className="btn btn-primary btn-lg"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading {effectiveType ? `${effectiveType.toUpperCase()}...` : "Asset..."}</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Upload {effectiveType ? `${effectiveType.toUpperCase()} Asset` : "Asset"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Just Uploaded Success Card */}
      {uploadedResult && (
        <div
          className="card"
          style={{
            border: "1.5px solid var(--success-border)",
            background: "linear-gradient(to bottom, #f0fdf4, #ffffff)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--success-light)",
                  color: "var(--success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>Upload Successful!</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {uploadedResult.fileName} • {formatBytes(uploadedResult.size)} • Type: {uploadedResult.fileType}
                </p>
              </div>
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--success-light)",
                color: "var(--success-hover)",
              }}
            >
              Ready to Use
            </span>
          </div>

          {/* Copyable URL bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--slate-100)",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--slate-200)",
            }}
          >
            <input
              type="text"
              readOnly
              value={uploadedResult.url}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                color: "var(--slate-800)",
              }}
            />
            <button
              type="button"
              onClick={() => handleCopy(uploadedResult.url, uploadedResult.id)}
              className="btn btn-sm btn-outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.35rem 0.65rem",
                fontSize: "0.78rem",
              }}
            >
              {copiedId === uploadedResult.id ? (
                <>
                  <Check size={14} style={{ color: "var(--success)" }} />
                  <span style={{ color: "var(--success)" }}>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy URL</span>
                </>
              )}
            </button>
            <a
              href={uploadedResult.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.35rem 0.65rem",
                fontSize: "0.78rem",
              }}
            >
              <ExternalLink size={14} />
              <span>Open</span>
            </a>
          </div>
        </div>
      )}

      {/* Upload History / Session Assets */}
      {history.length > 0 && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Recently Uploaded Assets ({history.length})
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Assets uploaded in your workspace. You can quickly copy their URLs to link into courses or lessons.
              </p>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="btn btn-sm btn-outline"
              style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}
            >
              Clear List
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {history.map((item) => {
              const cat = FILE_CATEGORIES.find((c) => c.type === item.fileType);
              const IconComp = cat ? cat.icon : File;

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-color)",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "var(--radius-sm)",
                        background: cat ? cat.badgeBg : "var(--slate-200)",
                        color: cat ? cat.badgeColor : "var(--slate-700)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={16} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color: "var(--slate-900)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.fileName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: cat ? cat.badgeColor : "inherit",
                          }}
                        >
                          {item.fileType}
                        </span>
                        <span>•</span>
                        <span>{formatBytes(item.size)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.url, item.id)}
                      className="btn btn-sm btn-outline"
                      title="Copy URL to clipboard"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.75rem",
                        padding: "0.3rem 0.55rem",
                      }}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={13} style={{ color: "var(--success)" }} />
                          <span style={{ color: "var(--success)" }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline"
                      title="Open asset in new tab"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0.3rem 0.55rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      <ExternalLink size={13} />
                    </a>

                    <button
                      type="button"
                      onClick={() => removeHistoryItem(item.id)}
                      className="btn btn-sm btn-ghost"
                      title="Remove from history list"
                      style={{
                        padding: "0.3rem 0.45rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
