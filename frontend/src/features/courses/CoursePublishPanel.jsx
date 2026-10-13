import { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Clock,
  Info,
  Sparkles,
  ShieldCheck,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROLES } from "../auth/roles.js";
import { useAuth } from "../auth/useAuth.js";
import { publishCourse } from "./courseService.js";

function flattenErrors(errors = {}) {
  if (typeof errors === "string") return [errors];
  if (Array.isArray(errors)) return errors;
  return Object.entries(errors).flatMap(([field, messages]) => {
    const values = Array.isArray(messages) ? messages : [messages];
    return values.map((message) => `${field !== "detail" && field !== "non_field_errors" ? `${field}: ` : ""}${message}`);
  });
}

export function CoursePublishPanel({ course, onPublished, token }) {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const [errors, setErrors] = useState(course.publish_errors || {});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [submitting, setSubmitting] = useState(false);
  const isPublished = course.status === "published";

  async function handlePublish() {
    if (!window.confirm("Are you sure you want to publish this course? Once published, it will be visible to students.")) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const updated = await publishCourse(course.id, token);
      setErrors({});
      setMessage("Course has been successfully published!");
      setMessageType("success");
      if (onPublished) onPublished(updated);
    } catch (error) {
      setErrors(error.data?.errors || error.data || {});
      setMessage(error.message || "Unable to publish course. Please resolve backend validation requirements below.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  const readinessErrors = flattenErrors(errors);

  return (
    <div className="ui-card" style={{ marginBottom: "2rem", borderLeft: isPublished ? "4px solid var(--success)" : "4px solid var(--warning)" }}>
      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              background: isPublished ? "var(--success-light)" : "var(--warning-light)",
              color: isPublished ? "var(--success)" : "var(--warning)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isPublished ? <Globe size={24} /> : <Clock size={24} />}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                Course Status & Publishing
              </h2>
              <span className={`badge-ui ${isPublished ? "badge-success" : "badge-warning"}`}>
                {isPublished ? "Published / Live" : "Draft / Unpublished"}
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              {isPublished
                ? "This course is published and available for student enrollment."
                : "Complete course content requirements and trigger backend validation to publish."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link to={`/courses/${course.id}/preview`} className="btn btn-secondary">
            <Eye size={16} />
            <span>Preview Course</span>
          </Link>

          {!isAdmin && (
            <button
              type="button"
              disabled={submitting || isPublished}
              onClick={handlePublish}
              className={`btn ${isPublished ? "btn-secondary" : "btn-primary"} btn-lg`}
            >
              {submitting ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  <span>Validating & Publishing...</span>
                </>
              ) : isPublished ? (
                <>
                  <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                  <span>Published</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Publish Course</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Message Alert Banner */}
      {message && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "0.85rem 1.1rem",
            borderRadius: "var(--radius-md)",
            background: messageType === "success" ? "var(--success-light)" : "var(--danger-light)",
            color: messageType === "success" ? "var(--success)" : "var(--danger)",
            border: `1px solid ${messageType === "success" ? "var(--success-border)" : "var(--danger-border)"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.9rem",
            fontWeight: 600
          }}
        >
          {messageType === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{message}</span>
        </div>
      )}

      {/* Readiness Requirements & Instructions */}
      <div style={{ marginTop: "1.25rem" }}>
        {isPublished ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            <ShieldCheck size={18} style={{ color: "var(--success)" }} />
            <span>All backend validation checks passed cleanly. Students can browse, cart, and enroll in this course.</span>
          </div>
        ) : readinessErrors.length > 0 ? (
          <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "700", color: "var(--danger)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              <AlertTriangle size={16} />
              <span>Publishing Readiness Requirements ({readinessErrors.length} issues)</span>
            </div>
            <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "var(--danger)", fontSize: "0.875rem", lineHeight: "1.6" }}>
              {readinessErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-muted)", background: "var(--bg-subtle)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
            <Info size={18} style={{ color: "var(--info)", flexShrink: 0 }} />
            <span>Automated DRF backend validation will run when you click <strong>Publish Course</strong> to verify sections, lessons, and pricing criteria.</span>
          </div>
        )}
      </div>
    </div>
  );
}
