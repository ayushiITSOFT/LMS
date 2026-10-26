import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Award,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { listAdminEnrollments } from "../features/enrollment/enrollmentService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataTable } from "../components/DataTable.jsx";

export function AdminEnrollmentsPage() {
  const { access } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "completed", "in_progress"

  const fetchEnrollments = useCallback(() => {
    if (!access) return;
    setLoading(true);
    setError(null);

    listAdminEnrollments(access)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setEnrollments(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load enrollments.");
      })
      .finally(() => setLoading(false));
  }, [access]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const filteredEnrollments = enrollments.filter((item) => {
    const isCompleted = Boolean(item.completed || item.is_completed || item.progress_percentage >= 100);

    if (statusFilter === "completed" && !isCompleted) return false;
    if (statusFilter === "in_progress" && isCompleted) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const student = (item.student_full_name || item.student_name || item.student?.username || "").toLowerCase();
    const email = (item.student_email || item.student?.email || "").toLowerCase();
    const course = (item.course_title || item.course?.title || "").toLowerCase();

    return student.includes(q) || email.includes(q) || course.includes(q);
  });

  const completedCount = enrollments.filter((e) => e.completed || e.is_completed || e.progress_percentage >= 100).length;
  const inProgressCount = enrollments.length - completedCount;
  const completionRate = enrollments.length ? Math.round((completedCount / enrollments.length) * 100) : 0;

  const columns = [
    {
      header: "ID",
      accessor: "id",
      cell: (row) => <code style={{ fontWeight: 700, color: "var(--text-muted, #64748b)" }}>#{row.id}</code>,
    },
    {
      header: "Student",
      accessor: "student",
      cell: (row) => {
        const name = row.student_full_name || row.student_name || row.student?.username || (typeof row.student === "string" ? row.student : `Student #${row.student}`);
        const email = row.student_email || row.student?.email || "";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.12)",
                color: "var(--primary, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                flexShrink: 0,
              }}
            >
              {(name || "S")[0].toUpperCase()}
            </div>
            <div>
              <strong style={{ fontSize: "0.9rem", color: "var(--text-main, #0f172a)", display: "block" }}>
                {name}
              </strong>
              {email && <span style={{ fontSize: "0.775rem", color: "var(--text-muted, #64748b)" }}>{email}</span>}
            </div>
          </div>
        );
      },
    },
    {
      header: "Course Enrolled",
      accessor: "course",
      cell: (row) => {
        const title = row.course_title || row.course?.title || row.course || "Course";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BookOpen size={15} style={{ color: "var(--primary, #6366f1)", flexShrink: 0 }} />
            <strong style={{ fontSize: "0.875rem", color: "var(--text-main, #0f172a)" }}>
              {title}
            </strong>
          </div>
        );
      },
    },
    {
      header: "Curriculum Progress",
      accessor: "progress_percentage",
      cell: (row) => {
        const pct = Math.min(100, Math.max(0, Number(row.progress_percentage || (row.completed ? 100 : 0))));
        return (
          <div style={{ minWidth: "130px", maxWidth: "180px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem", color: "var(--text-muted, #64748b)" }}>
              <span>Completion</span>
              <strong style={{ color: "var(--text-main, #0f172a)" }}>{pct}%</strong>
            </div>
            <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: pct >= 100 ? "#10b981" : "var(--primary, #6366f1)",
                  borderRadius: "3px",
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "Credential Status",
      accessor: "has_certificate",
      cell: (row) => {
        const hasCert = Boolean(row.has_certificate || row.certificate_id);
        const isDone = Boolean(row.completed || row.is_completed || row.progress_percentage >= 100);

        if (hasCert) {
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.2rem 0.55rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                background: "rgba(16, 185, 129, 0.1)",
                color: "#059669",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <Award size={12} />
              <span>Certified</span>
            </span>
          );
        }
        if (isDone) {
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.2rem 0.55rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--primary, #6366f1)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
              }}
            >
              <CheckCircle2 size={12} />
              <span>100% Finished</span>
            </span>
          );
        }
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.2rem 0.55rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background: "var(--bg-subtle, #f8fafc)",
              color: "var(--text-muted, #64748b)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Clock size={12} />
            <span>In Progress</span>
          </span>
        );
      },
    },
    {
      header: "Enrolled Date",
      accessor: "created_at",
      cell: (row) => (
        <span style={{ fontSize: "0.825rem", color: "var(--text-muted, #64748b)" }}>
          {new Date(row.created_at || Date.now()).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Header with Breadcrumb & Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          background: "var(--bg-surface, #ffffff)",
          padding: "1.5rem 1.75rem",
          borderRadius: "var(--radius-lg, 16px)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div>
          <Link to="/admin" className="btn btn-secondary btn-sm" style={{ marginBottom: "0.6rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <ArrowLeft size={14} />
            <span>Admin Dashboard</span>
          </Link>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Enrollment Monitoring
          </h1>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.925rem", margin: "0.25rem 0 0 0" }}>
            Supervise course registrations, student progress rates, and completed certifications.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEnrollments}
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Top Metric Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="card" style={{ padding: "1rem 1.25rem", borderRadius: "12px", background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Total Enrollments</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main, #0f172a)", marginTop: "0.25rem" }}>{enrollments.length}</div>
        </div>
        <div className="card" style={{ padding: "1rem 1.25rem", borderRadius: "12px", background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Completed Courses</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#059669", marginTop: "0.25rem" }}>{completedCount}</div>
        </div>
        <div className="card" style={{ padding: "1rem 1.25rem", borderRadius: "12px", background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>In Progress</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary, #6366f1)", marginTop: "0.25rem" }}>{inProgressCount}</div>
        </div>
        <div className="card" style={{ padding: "1rem 1.25rem", borderRadius: "12px", background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Completion Rate</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0284c7", marginTop: "0.25rem" }}>{completionRate}%</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1rem 1.25rem",
          borderRadius: "var(--radius-lg, 14px)",
          border: "1px solid var(--border-color)",
          background: "var(--bg-surface, #ffffff)",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontWeight: 600 }}
          >
            All Enrollments ({enrollments.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completed")}
            className={`btn btn-sm ${statusFilter === "completed" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontWeight: 600 }}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("in_progress")}
            className={`btn btn-sm ${statusFilter === "in_progress" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontWeight: 600 }}
          >
            In Progress ({inProgressCount})
          </button>
        </div>

        <div style={{ position: "relative", maxWidth: "320px", width: "100%" }}>
          <input
            className="form-input"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem", margin: 0, fontSize: "0.85rem", width: "100%" }}
          />
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--slate-400, #94a3b8)",
            }}
          />
        </div>
      </div>

      {/* 4. Table */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEnrollments} />
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState
          title="No Enrollments Found"
          description={search ? `No records matching "${search}".` : "No platform course enrollments recorded."}
          icon="🎓"
        />
      ) : (
        <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "var(--radius-lg, 14px)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <DataTable columns={columns} data={filteredEnrollments} keyField="id" />
        </div>
      )}
    </div>
  );
}
