import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { ROLE_LABELS } from "../features/auth/roles.js";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1.5rem", textAlign: "center", minHeight: "60vh" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--danger-light)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", border: "1px solid var(--danger-border)" }}>
        <ShieldAlert size={36} />
      </div>

      <span className="badge badge-danger" style={{ marginBottom: "0.75rem", fontSize: "0.8rem", padding: "0.25rem 0.65rem" }}>
        403 Access Restricted
      </span>

      <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--slate-900)", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
        Permission Denied
      </h1>

      <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "480px", lineHeight: "1.6", marginBottom: "0.5rem" }}>
        Your active account role {role ? (<strong>({ROLE_LABELS[role] || role})</strong>) : ""} does not have permission to access this page or administrative resource.
      </p>

      <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", maxWidth: "440px", marginBottom: "2rem" }}>
        If you believe this is an error, please contact your LMS administrator or sign in with an authorized role account.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        {isAuthenticated ? (
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            <LogIn size={16} />
            <span>Sign In to Account</span>
          </Link>
        )}
      </div>
    </div>
  );
}

