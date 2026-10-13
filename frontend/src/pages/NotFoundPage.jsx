import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, ArrowLeft, Home, Compass } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1.5rem", textAlign: "center", minHeight: "60vh" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--slate-100)", color: "var(--slate-600)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
        <Compass size={36} />
      </div>

      <span className="badge badge-warning" style={{ marginBottom: "0.75rem", fontSize: "0.8rem", padding: "0.25rem 0.65rem" }}>
        404 Page Not Found
      </span>

      <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--slate-900)", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
        Lost in the Cloud?
      </h1>

      <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "480px", lineHeight: "1.6", marginBottom: "2rem" }}>
        The page or resource you are looking for doesn't exist, has been removed, or had its URL updated.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
