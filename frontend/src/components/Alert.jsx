import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export function Alert({ variant = "info", title, message, children, onClose }) {
  const Icon =
    variant === "success"
      ? CheckCircle2
      : variant === "danger" || variant === "error"
      ? AlertCircle
      : variant === "warning"
      ? AlertTriangle
      : Info;

  const resolvedVariant = variant === "error" ? "danger" : variant;

  return (
    <div className={`alert-ui alert-${resolvedVariant}`}>
      <div className="alert-icon">
        <Icon size={18} />
      </div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{message || children}</div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="alert-close-btn" aria-label="Dismiss alert">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
