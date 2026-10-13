import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User, Mail, Lock, Eye, EyeOff, UserCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";

function fieldError(errors, name) {
  const value = errors?.[name];
  return Array.isArray(value) ? value.join(" ") : value;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", email: "", password: "", role: "student" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrors({});

    const nextErrors = {
      username: !values.username.trim() ? "Username is required." : "",
      email: !values.email.trim() ? "Email is required." : "",
      password: values.password.length < 8 ? "Password must be at least 8 characters." : "",
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });
      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to register account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "2rem 0" }}>
      <section className="card auth-page" style={{ width: "100%", maxWidth: "460px", padding: "2.5rem", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-xl)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem" }}>
          <div className="app-brand-logo" style={{ width: "48px", height: "48px", marginBottom: "1rem", borderRadius: "var(--radius-lg)" }}>
            <BookOpen size={24} />
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", letterSpacing: "-0.03em", textAlign: "center" }}>Create your Account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", textAlign: "center", marginTop: "0.35rem" }}>
            Join LMS as a Student
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {message && (
            <div style={{ padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", fontSize: "0.88rem", fontWeight: 600, border: "1px solid var(--danger-border)", marginBottom: "1.25rem" }}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              <input
                className="input"
                style={{ paddingLeft: "2.6rem" }}
                autoComplete="username"
                name="username"
                onChange={updateField}
                type="text"
                placeholder="Choose a username"
                value={values.username}
              />
            </div>
            {fieldError(errors, "username") && (
              <span className="field-error">{fieldError(errors, "username")}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              <input
                className="input"
                style={{ paddingLeft: "2.6rem" }}
                autoComplete="email"
                name="email"
                onChange={updateField}
                type="email"
                placeholder="name@company.com"
                value={values.email}
              />
            </div>
            {fieldError(errors, "email") && (
              <span className="field-error">{fieldError(errors, "email")}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              <input
                className="input"
                style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}
                autoComplete="new-password"
                name="password"
                onChange={updateField}
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={values.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", padding: "0.2rem" }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldError(errors, "password") && (
              <span className="field-error">{fieldError(errors, "password")}</span>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "0.75rem" }}>
            {submitting ? "Creating account..." : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="auth-switch" style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 700 }}>Sign In</Link>
        </p>
        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed var(--slate-200)", textAlign: "center" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
            ℹ️ <strong>Instructor accounts</strong> are provisioned directly by system administrators and cannot be registered publicly.
          </p>
        </div>
      </section>
    </div>
  );
}
