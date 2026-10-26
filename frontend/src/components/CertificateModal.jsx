import { useState } from "react";
import { Award, Check, Copy, Printer, X, ShieldCheck } from "lucide-react";

export function CertificateModal({ certificate, onClose, defaultStudentName }) {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const studentName =
    certificate.student_name ||
    certificate.student_full_name ||
    defaultStudentName ||
    "Student";

  const courseTitle =
    certificate.course?.title ||
    certificate.course_title ||
    (typeof certificate.course === "string" ? certificate.course : "") ||
    "Course Completion";

  const instructorName =
    certificate.instructor_name ||
    certificate.course?.instructor?.username ||
    certificate.instructor ||
    "Course Faculty";

  const certId =
    certificate.certificate_id ||
    (certificate.id ? `CERT-${certificate.id}` : "CERT-OFFICIAL");

  const issueDate = new Date(
    certificate.issued_at || certificate.created_at || Date.now()
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const verifyUrl =
    certificate.verification_url ||
    `${window.location.origin}/verify/${certId}`;

  function handleCopy() {
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="certificate-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="certificate-container"
        style={{
          maxWidth: "760px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          margin: "auto",
        }}
      >
        {/* Certificate Card */}
        <div
          id="printable-certificate"
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "3rem 2.5rem",
            position: "relative",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            border: "8px double var(--primary, #4f46e5)",
            outline: "2px solid #e2e8f0",
            outlineOffset: "-12px",
          }}
        >
          {/* Close button (hidden on print) */}
          <button
            type="button"
            onClick={onClose}
            className="no-print"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              padding: "0.4rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Close"
          >
            <X size={20} />
          </button>

          {/* Academic Crest */}
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(245, 158, 11, 0.35)",
                color: "#ffffff",
              }}
            >
              <Award size={36} />
            </div>
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              letterSpacing: "3px",
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: "0.25rem",
            }}
          >
            LMS
          </div>

          <h2
            style={{
              fontSize: "1.9rem",
              fontWeight: 900,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#0f172a",
              margin: "0.25rem 0 0.5rem 0",
            }}
          >
            Certificate of Completion
          </h2>

          <div
            style={{
              width: "80px",
              height: "3px",
              background: "var(--primary, #4f46e5)",
              margin: "0.75rem auto 1.5rem auto",
              borderRadius: "2px",
            }}
          />

          <p
            style={{
              fontSize: "0.95rem",
              color: "#64748b",
              fontStyle: "italic",
              marginBottom: "0.5rem",
            }}
          >
            This official credential certifies that
          </p>

          <h3
            style={{
              fontSize: "2.15rem",
              fontWeight: 800,
              color: "var(--primary, #4f46e5)",
              margin: "0.5rem 0 1.25rem 0",
              letterSpacing: "0.5px",
            }}
          >
            {studentName}
          </h3>

          <p
            style={{
              fontSize: "0.95rem",
              color: "#475569",
              maxWidth: "540px",
              margin: "0 auto 1.25rem auto",
              lineHeight: 1.6,
            }}
          >
            has successfully fulfilled all curriculum requirements, knowledge
            assessments, and professional standards for the comprehensive course
          </p>

          <h4
            style={{
              fontSize: "1.45rem",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 2rem 0",
            }}
          >
            {courseTitle}
          </h4>

          {/* Signatures & Issue Date Metadata */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              borderTop: "1px solid #e2e8f0",
              borderBottom: "1px solid #e2e8f0",
              padding: "1.25rem 0.5rem",
              marginBottom: "1.5rem",
              textAlign: "left",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "cursive",
                  fontSize: "1.3rem",
                  color: "#334155",
                  marginBottom: "0.2rem",
                  transform: "rotate(-2deg)",
                }}
              >
                {instructorName}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Course Instructor / Faculty
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "0.2rem",
                }}
              >
                {issueDate}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Issue & Verification Date
              </div>
            </div>
          </div>

          {/* Credential Identification & Verification Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
              background: "#f8fafc",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "0.825rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={18} style={{ color: "#10b981" }} />
              <span style={{ color: "#64748b" }}>Credential ID:</span>
              <code
                style={{
                  fontWeight: 700,
                  color: "#0f172a",
                  background: "#ffffff",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                }}
              >
                {certId}
              </code>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#10b981",
                  background: "#ecfdf5",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "999px",
                  border: "1px solid #a7f3d0",
                }}
              >
                ✓ Officially Verified
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions Bar (hidden on print) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            background: "var(--bg-surface)",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            padding: "0.85rem 1.25rem",
            borderRadius: "12px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-outline btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            {copied ? (
              <>
                <Check size={14} style={{ color: "var(--success)" }} />
                <span>Verification Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Verification Link</span>
              </>
            )}
          </button>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
