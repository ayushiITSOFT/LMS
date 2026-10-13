import { User, Mail, Shield, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { ROLE_LABELS } from "../features/auth/roles.js";

export function ProfilePage() {
  const { user, role } = useAuth();
  const studentName = user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "User Account";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: "680px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Account Profile</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          View and verify your registered platform credentials and role permissions.
        </p>
      </div>

      {/* Main Profile Identity Card */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* User Identity Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.25rem" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--slate-900)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: "800" }}>
            {(user?.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--slate-900)", margin: 0 }}>
              {studentName}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.35rem" }}>
              <span className="badge badge-info" style={{ textTransform: "uppercase" }}>
                {ROLE_LABELS[role] || role}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--success)", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontWeight: 600 }}>
                <CheckCircle2 size={13} /> Active Account
              </span>
            </div>
          </div>
        </div>

        {/* Read-only Form Field Groups */}
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--slate-800)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.4rem" }}>
            <User size={16} style={{ color: "var(--primary)" }} />
            <span>Personal Identity Details</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Username</label>
              <div style={{ position: "relative" }}>
                <input className="input" value={user?.username || ""} disabled readOnly style={{ paddingLeft: "2.25rem" }} />
                <User size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input className="input" value={user?.email || "No email registered"} disabled readOnly style={{ paddingLeft: "2.25rem" }} />
                <Mail size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--slate-800)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.4rem", marginTop: "0.5rem" }}>
            <Shield size={16} style={{ color: "var(--primary)" }} />
            <span>Access Control & Security</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Platform Role</label>
              <div style={{ position: "relative" }}>
                <input className="input" value={ROLE_LABELS[role] || role || "Student"} disabled readOnly style={{ paddingLeft: "2.25rem" }} />
                <Shield size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Authentication Status</label>
              <div style={{ position: "relative" }}>
                <input className="input" value="JWT Verified Session" disabled readOnly style={{ paddingLeft: "2.25rem" }} />
                <Lock size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

