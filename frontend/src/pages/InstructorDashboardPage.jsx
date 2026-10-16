import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  FileText,
  Users,
  DollarSign,
  Star,
  PlusCircle,
  ArrowRight,
  BarChart3,
  Megaphone,
  Sparkles,
  Layers,
  GraduationCap,
} from "lucide-react";
import { getInstructorDashboard } from "../features/courses/courseService.js";
import { StatCard } from "../components/StatCard.jsx";
import { StatCardSkeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

export function InstructorDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    getInstructorDashboard()
      .then((data) => {
        setMetrics(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load instructor metrics.");
      })
      .finally(() => setLoading(false));
  }, []);

  const recentEnrollments = metrics?.recent_enrollments || [];

  const columns = [
    {
      header: "Student",
      accessor: "student",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem" }}>
            {(row.student?.username || row.student_name || "S").charAt(0).toUpperCase()}
          </div>
          <strong style={{ color: "var(--text-main)", fontSize: "0.875rem" }}>
            {row.student?.username || row.student_name || "Student"}
          </strong>
        </div>
      ),
    },
    {
      header: "Course Enrolled",
      accessor: "course",
      cell: (row) => (
        <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
          {row.course?.title || row.course_title || "Course"}
        </span>
      ),
    },
    {
      header: "Enrolled Date",
      accessor: "created_at",
      cell: (row) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {new Date(row.created_at || Date.now()).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="instructor-studio-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Instructor Studio Hero Header */}
      <div className="instructor-hero-banner">
        <div className="instructor-hero-content">
          <div className="instructor-hero-badge">
            <span className="badge-dot" style={{ background: "#818cf8" }} />
            <span>Instructor Studio & Curriculum Management</span>
          </div>
          <h1 className="instructor-hero-title">Instructor Studio</h1>
          <p className="instructor-hero-subtitle">
            Manage your course catalog, author interactive lessons, track student enrollments, and analyze revenue metrics in real-time.
          </p>
        </div>
        <div className="instructor-hero-actions">
          <Link to="/instructor/courses/create" className="btn btn-primary btn-lg instructor-cta-btn">
            <PlusCircle size={18} />
            <span>Create Course</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid instructor-stats-grid">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          {/* 2. Key KPI Metric Stat Cards */}
          <div className="stats-grid instructor-stats-grid">
            <StatCard title="Total Courses" value={metrics?.total_courses ?? 0} icon={BookOpen} variant="primary" helperText="Total authored courses" />
            <StatCard title="Published Courses" value={metrics?.published_courses ?? 0} icon={CheckCircle} variant="success" helperText="Live in marketplace" />
            <StatCard title="Draft Courses" value={metrics?.draft_courses ?? 0} icon={FileText} variant="warning" helperText="Pending publication" />
            <StatCard title="Total Students" value={metrics?.total_students ?? 0} icon={Users} variant="info" helperText="Active course learners" />
            <StatCard title="Total Revenue" value={formatCurrency(metrics?.total_revenue || 0)} icon={DollarSign} variant="success" helperText="Net course earnings" />
            <StatCard title="Avg Rating" value={metrics?.average_rating ? `${metrics.average_rating}` : "N/A"} icon={Star} variant="warning" helperText="Student evaluation score" />
          </div>

          {/* 3. Primary Activity Section Banner */}
          <section className="instructor-action-card">
            <div className="instructor-action-inner">
              <div className="instructor-action-info">
                <span className="instructor-action-tag">Studio Primary Action</span>
                <h3 className="instructor-action-title">Author & Publish New Curriculum</h3>
                <p className="instructor-action-desc">
                  Structure learning sections, upload video & PDF lessons, create quizzes, configure pricing, and publish your course.
                </p>
              </div>
              <Link to="/instructor/courses/create" className="btn btn-success btn-lg instructor-action-btn">
                <PlusCircle size={18} />
                <span>Start Course Creation</span>
              </Link>
            </div>
          </section>

          {/* 4. Authoring Catalog Overview */}
          <section className="ui-card instructor-catalog-card">
            <div className="instructor-card-header">
              <div>
                <h2 className="h3" style={{ margin: 0 }}>Authoring Catalog Overview</h2>
                <p className="text-subtitle" style={{ margin: "0.2rem 0 0 0" }}>Overview of course publication status across your studio</p>
              </div>
              <Link to="/instructor/courses" className="btn btn-outline btn-sm">
                <span>View All Courses</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="instructor-catalog-grid">
              <div className="instructor-catalog-box published">
                <div className="catalog-box-top">
                  <span className="catalog-box-label">Published Courses</span>
                  <span className="badge-ui badge-success">Live Storefront</span>
                </div>
                <div className="catalog-box-val">{metrics?.published_courses ?? 0}</div>
                <div className="catalog-box-sub">Published and accepting student enrollments</div>
              </div>

              <div className="instructor-catalog-box draft">
                <div className="catalog-box-top">
                  <span className="catalog-box-label">Draft Courses</span>
                  <span className="badge-ui badge-warning">Draft State</span>
                </div>
                <div className="catalog-box-val">{metrics?.draft_courses ?? 0}</div>
                <div className="catalog-box-sub">Curriculum in development, ready for edit</div>
              </div>
            </div>
          </section>

          {/* 5 & 6. Two-Column Grid: Recent Enrollments & Studio Management Tools */}
          <div className="instructor-two-col-grid">
            {/* Recent Enrollments Table */}
            <section className="ui-card instructor-activity-card">
              <div className="instructor-card-header" style={{ marginBottom: "1rem" }}>
                <div>
                  <h2 className="h3" style={{ margin: 0 }}>Recent Student Enrollments</h2>
                  <p className="text-subtitle" style={{ margin: "0.2rem 0 0 0" }}>Real-time log of student course registrations</p>
                </div>
              </div>
              <DataTable columns={columns} data={recentEnrollments} keyField="id" emptyText="No student enrollments recorded yet." />
            </section>

            {/* Studio Tools & Quick Actions */}
            <section className="ui-card instructor-tools-card">
              <div className="instructor-card-header" style={{ marginBottom: "1rem" }}>
                <div>
                  <h2 className="h3" style={{ margin: 0 }}>Studio Management Modules</h2>
                  <p className="text-subtitle" style={{ margin: "0.2rem 0 0 0" }}>Direct navigation to studio features</p>
                </div>
              </div>
              <div className="instructor-tools-list">
                <Link to="/instructor/courses" className="instructor-tool-link">
                  <div className="tool-icon-wrap primary">
                    <BookOpen size={18} />
                  </div>
                  <div className="tool-text">
                    <strong>Course Management Catalog</strong>
                    <span>Build curriculum, lessons, assignments, and pricing</span>
                  </div>
                  <ArrowRight size={15} className="tool-arrow" />
                </Link>

                <Link to="/instructor/announcements" className="instructor-tool-link">
                  <div className="tool-icon-wrap purple">
                    <Megaphone size={18} />
                  </div>
                  <div className="tool-text">
                    <strong>Course Broadcast Announcements</strong>
                    <span>Send announcements and updates to students</span>
                  </div>
                  <ArrowRight size={15} className="tool-arrow" />
                </Link>

                <Link to="/instructor/analytics" className="instructor-tool-link">
                  <div className="tool-icon-wrap info">
                    <BarChart3 size={18} />
                  </div>
                  <div className="tool-text">
                    <strong>Detailed Performance Analytics</strong>
                    <span>Track course views, sales trends, and ratings</span>
                  </div>
                  <ArrowRight size={15} className="tool-arrow" />
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
