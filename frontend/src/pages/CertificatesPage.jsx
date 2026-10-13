import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth.js";
import { ROLES } from "../features/auth/roles.js";
import { listCertificates } from "../features/certificate/certificateService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { CertificateModal } from "../components/CertificateModal.jsx";

export function CertificatesPage() {
  const { access, user, role } = useAuth();
  const isInstructorOrAdmin = role === ROLES.INSTRUCTOR || role === ROLES.ADMIN;
  const [activeTab, setActiveTab] = useState("earned"); // "earned" or "teaching"
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    if (!access) return;
    setLoading(true);
    setError(null);

    const params = activeTab === "teaching" ? { teaching: true } : {};
    listCertificates(access, params)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setCertificates(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load certificates.");
      })
      .finally(() => setLoading(false));
  }, [access, activeTab]);

  const defaultStudentName = user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Student";

  const columns = [
    {
      header: "Certificate Code",
      accessor: "certificate_id",
      cell: (row) => <code style={{ fontWeight: 700 }}>{row.certificate_id || `#CERT-${row.id}`}</code>,
    },
    ...(activeTab === "teaching"
      ? [
          {
            header: "Student Name",
            accessor: "student_name",
            cell: (row) => <strong>{row.student_name || "Student"}</strong>,
          },
        ]
      : []),
    {
      header: "Course Name",
      accessor: "course",
      cell: (row) => <strong>{row.course?.title || row.course_title || row.course || "Course"}</strong>,
    },
    {
      header: "Issue Date",
      accessor: "issued_at",
      cell: (row) => new Date(row.issued_at || row.created_at || Date.now()).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (row) => (
        <button
          type="button"
          onClick={() => setSelectedCert(row)}
          className="btn btn-primary"
          style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem" }}
        >
          📜 View Certificate
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
            {activeTab === "teaching" ? "Course Certificates Issued" : "My Verified Certificates"}
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            {activeTab === "teaching"
              ? "Official certificates awarded to students completing your courses."
              : "View and share your official course completion credentials."}
          </p>
        </div>

        {isInstructorOrAdmin && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setActiveTab("earned")}
              className={`btn ${activeTab === "earned" ? "btn-primary" : "btn-secondary"}`}
            >
              My Earned Certificates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("teaching")}
              className={`btn ${activeTab === "teaching" ? "btn-primary" : "btn-secondary"}`}
            >
              Issued to Students
            </button>
          </div>
        )}
      </div>

      {/* Completion Requirement Policy Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem 1rem",
          background: "rgba(99, 102, 241, 0.05)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.85rem",
          color: "var(--slate-700)",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>🎓</span>
        <span>
          <strong>Completion Policy:</strong> Course certificates are strictly awarded only after learning and completing 100% of all curriculum lessons.
        </span>
      </div>

      {loading ? (
        <Skeleton height="250px" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : certificates.length === 0 ? (
        <EmptyState
          title={activeTab === "teaching" ? "No Certificates Issued Yet" : "No Certificates Earned Yet"}
          description={
            activeTab === "teaching"
              ? "When enrolled students finish your course or you award certificates in Course Builder, they will appear here."
              : "Complete 100% of your enrolled courses to automatically unlock downloadable certificates."
          }
          actionText={activeTab === "teaching" ? "My Instructor Courses" : "My Courses"}
          actionLink={activeTab === "teaching" ? "/instructor/courses" : "/my-courses"}
          icon="📜"
        />
      ) : (
        <DataTable columns={columns} data={certificates} keyField="id" />
      )}

      {/* Unified Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
          defaultStudentName={defaultStudentName}
        />
      )}
    </div>
  );
}
