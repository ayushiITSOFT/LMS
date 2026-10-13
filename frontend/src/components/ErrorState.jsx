import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({ title = "Something went wrong", message = "An error occurred while loading data.", onRetry }) {
  return (
    <div className="empty-box" style={{ borderColor: "var(--danger-border)", background: "var(--danger-light)" }}>
      <div className="empty-box-icon" style={{ background: "#fee2e2", color: "var(--danger)" }}>
        <AlertTriangle size={28} />
      </div>
      <h3 className="h3" style={{ fontSize: "1.15rem", color: "#991b1b" }}>{title}</h3>
      <p className="text-subtitle" style={{ color: "#b91c1c", maxWidth: "480px" }}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-danger btn-sm" style={{ marginTop: "0.5rem" }}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}
