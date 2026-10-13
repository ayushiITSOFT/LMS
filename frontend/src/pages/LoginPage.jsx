import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  GraduationCap,
  Award,
  Zap,
  Users,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { ROLES } from "../features/auth/roles.js";

function fieldError(errors, name) {
  const value = errors?.[name];
  return Array.isArray(value) ? value.join(" ") : value;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [message, setMessage] = useState(
    location.state?.registered ? "Account created successfully. Please log in." : ""
  );
  const [submitting, setSubmitting] = useState(false);

  function handleKeyDown(e) {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  }

  function updateField(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrors({});

    if (!values.username.trim() || !values.password) {
      setErrors({
        username: !values.username.trim() ? "Username or email is required." : "",
        password: !values.password ? "Password is required." : "",
      });
      return;
    }

    setSubmitting(true);

    try {
      const nextAuth = await login({
        username: values.username.trim(),
        password: values.password,
      });
      const userRole = nextAuth?.user?.role;

      let redirectPath = "/dashboard";
      if (userRole === ROLES.ADMIN) redirectPath = "/admin";
      else if (userRole === ROLES.INSTRUCTOR) redirectPath = "/instructor";

      const fromPath = location.state?.from?.pathname;
      const finalRedirect =
        fromPath && fromPath !== "/login" && fromPath !== "/dashboard"
          ? fromPath
          : redirectPath;

      navigate(finalRedirect, { replace: true });
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Invalid credentials. Please verify username and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes loginBlobA {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.12) translate(24px, -18px); }
        }
        @keyframes loginBlobB {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-20px, 22px); }
        }
        @keyframes loginFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .login-input:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -4px rgba(99,102,241,0.55) !important;
        }
        .login-submit:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      {/* Full-viewport split layout — no scroll */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        height: "100%",
        overflow: "hidden",
      }}>

        {/* ── LEFT PANEL: decorative gradient ── */}
        <div style={{
          position: "relative",
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 45%, #4c1d95 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 3.5rem",
          overflow: "hidden",
        }}>
          {/* Animated blobs */}
          <div style={{
            position: "absolute", top: "-80px", left: "-80px",
            width: "380px", height: "380px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
            animation: "loginBlobA 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "-100px", right: "-60px",
            width: "420px", height: "420px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)",
            animation: "loginBlobB 10s ease-in-out infinite",
          }} />
          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "380px" }}>
            {/* Logo */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.65rem",
              marginBottom: "2.5rem",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 20px rgba(99,102,241,0.45)",
              }}>
                <BookOpen size={20} color="#fff" />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                LMS
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "2.4rem", fontWeight: 900, lineHeight: 1.15,
              letterSpacing: "-0.04em", color: "#fff", marginBottom: "1rem",
            }}>
              Learn Without<br />
              <span style={{
                backgroundImage: "linear-gradient(90deg, #a5b4fc, #e879f9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Limits.
              </span>
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: "0.95rem",
              lineHeight: 1.65, marginBottom: "2.5rem",
            }}>
              Expert-led courses, hands-on projects, and industry certificates — all in one platform.
            </p>

            {/* Feature bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: GraduationCap, text: "500+ expert-led courses" },
                { icon: Award,         text: "Verified certificates" },
                { icon: Zap,           text: "Interactive quizzes & assignments" },
                { icon: Users,         text: "10,000+ active learners" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} color="#a5b4fc" />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Floating stat card */}
            <div style={{
              marginTop: "2.5rem",
              padding: "1rem 1.25rem",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "14px",
              display: "flex", alignItems: "center", gap: "1rem",
              animation: "loginFloat 4s ease-in-out infinite",
            }}>
              <div style={{ display: "flex" }}>
                {["#6366f1","#8b5cf6","#10b981"].map((c, i) => (
                  <div key={i} style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: c, border: "2px solid rgba(255,255,255,0.5)",
                    marginLeft: i > 0 ? "-6px" : 0,
                  }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>
                  1,240 learners online now
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                  Join them today — it's free
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: login form ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main)",
          padding: "2rem",
          overflow: "auto",
          animation: "loginFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>

            {/* Header */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
                marginBottom: "1rem",
              }}>
                <BookOpen size={22} color="#fff" />
              </div>
              <h2 style={{
                fontSize: "1.75rem", fontWeight: 800,
                letterSpacing: "-0.03em", color: "var(--text-main)", margin: 0,
              }}>
                Welcome Back
              </h2>
              <p style={{
                color: "var(--text-muted)", fontSize: "0.875rem",
                margin: "0.3rem 0 0 0",
              }}>
                Sign in to access your courses, quizzes, and certificates.
              </p>
            </div>

            {/* Feedback message */}
            {message && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: "0.6rem",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                background: message.includes("created") ? "#ecfdf5" : "#fef2f2",
                color: message.includes("created") ? "#065f46" : "#b91c1c",
                fontSize: "0.85rem", fontWeight: 600,
                border: `1px solid ${message.includes("created") ? "#a7f3d0" : "#fecaca"}`,
                marginBottom: "1.25rem",
              }}>
                {message.includes("created")
                  ? <CheckCircle2 size={16} style={{ color: "#10b981", flexShrink: 0, marginTop: "1px" }} />
                  : <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0, marginTop: "1px" }} />
                }
                <span>{message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Username */}
              <div>
                <label style={{
                  display: "block", fontSize: "0.825rem",
                  fontWeight: 600, color: "var(--text-secondary)",
                  marginBottom: "0.4rem",
                }}>
                  Username or Email
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{
                    position: "absolute", left: "0.9rem", top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--slate-400)", pointerEvents: "none",
                  }} />
                  <input
                    className="login-input"
                    autoComplete="username"
                    name="username"
                    type="text"
                    placeholder="e.g. student1 or your email"
                    value={values.username}
                    onChange={updateField}
                    style={{
                      width: "100%", height: "44px",
                      paddingLeft: "2.5rem", paddingRight: "1rem",
                      border: `1.5px solid ${fieldError(errors, "username") ? "#ef4444" : "var(--border-color)"}`,
                      borderRadius: "10px",
                      background: "var(--bg-surface)",
                      color: "var(--text-main)",
                      fontSize: "0.9rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  />
                </div>
                {fieldError(errors, "username") && (
                  <span style={{ fontSize: "0.775rem", color: "#ef4444", marginTop: "0.3rem", display: "block" }}>
                    {fieldError(errors, "username")}
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{
                      background: "none", border: "none",
                      color: "var(--primary)", fontSize: "0.8rem",
                      fontWeight: 600, cursor: "pointer", padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{
                    position: "absolute", left: "0.9rem", top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--slate-400)", pointerEvents: "none",
                  }} />
                  <input
                    className="login-input"
                    autoComplete="current-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={updateField}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyDown}
                    style={{
                      width: "100%", height: "44px",
                      paddingLeft: "2.5rem", paddingRight: "2.75rem",
                      border: `1.5px solid ${fieldError(errors, "password") ? "#ef4444" : "var(--border-color)"}`,
                      borderRadius: "10px",
                      background: "var(--bg-surface)",
                      color: "var(--text-main)",
                      fontSize: "0.9rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: "0.75rem", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--slate-400)", padding: "0.25rem",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {capsLockActive && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    fontSize: "0.75rem", color: "#f59e0b",
                    marginTop: "0.3rem", fontWeight: 600,
                  }}>
                    <AlertCircle size={12} />
                    <span>Caps Lock is ON</span>
                  </div>
                )}
                {fieldError(errors, "password") && (
                  <span style={{ fontSize: "0.775rem", color: "#ef4444", marginTop: "0.3rem", display: "block" }}>
                    {fieldError(errors, "password")}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="login-submit"
                style={{
                  width: "100%", height: "46px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff", border: "none",
                  fontSize: "0.925rem", fontWeight: 700,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "0.5rem",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px -4px rgba(99,102,241,0.45)",
                  transition: "all 0.2s ease",
                  marginTop: "0.25rem",
                }}
              >
                {submitting ? (
                  <>
                    <span style={{
                      width: "15px", height: "15px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Security badge */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "0.4rem", marginTop: "1rem",
              fontSize: "0.75rem", color: "var(--text-light)",
            }}>
              <ShieldCheck size={13} style={{ color: "#10b981" }} />
              <span>256-bit SSL Encrypted · Single Sign-On Supported</span>
            </div>

            {/* Divider + register link */}
            <div style={{
              marginTop: "1.25rem", paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-color)",
              textAlign: "center",
              fontSize: "0.875rem", color: "var(--text-muted)",
            }}>
              New to LMS?{" "}
              <Link to="/register" style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 2000,
            display: "flex", alignItems: "center",
            justifyContent: "center", padding: "1rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForgotModal(false); }}
        >
          <div style={{
            maxWidth: "440px", width: "100%",
            padding: "2rem",
            borderRadius: "18px",
            background: "var(--bg-surface)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            position: "relative",
          }}>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: "absolute", top: "1rem", right: "1rem",
                background: "none", border: "none",
                cursor: "pointer", color: "var(--slate-400)",
                display: "flex", alignItems: "center",
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              background: "var(--primary-light)", color: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <HelpCircle size={22} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", margin: "0 0 0.4rem 0" }}>
              Forgot Password?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 1.25rem 0" }}>
              To recover your account, contact your LMS administrator or reach out via:
            </p>

            <div style={{
              background: "var(--bg-subtle)", padding: "1rem",
              borderRadius: "10px", border: "1px solid var(--border-color)",
              fontSize: "0.85rem", marginBottom: "1.5rem",
              color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.4rem",
            }}>
              <div>• <strong>Support Email:</strong> <code>support@lms.io</code></div>
              <div>• <strong>Admin Desk:</strong> Contact your campus or enterprise LMS admin.</div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                width: "100%", height: "42px", borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff", border: "none", fontWeight: 700,
                fontSize: "0.9rem", cursor: "pointer",
              }}
            >
              Got it, back to login
            </button>
          </div>
        </div>
      )}
    </>
  );
}
