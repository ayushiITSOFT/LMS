import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  MoreHorizontal,
  Wrench,
  Edit3,
  Eye,
  Award,
  CheckSquare,
  PlusCircle,
  BookOpen,
} from "lucide-react";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { deleteCourse, listPublishedCourses } from "../features/courses/courseService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { getMediaUrl } from "../utils/mediaUrl.js";
import { formatCurrency } from "../utils/formatCurrency.js";

function CourseActionsDropdown({ course, isAdmin, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const builderPath = isAdmin
    ? `/courses/${course.id}/builder`
    : `/instructor/courses/${course.id}/builder`;

  return (
    <div
      ref={menuRef}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        position: "relative",
      }}
    >
      {/* Primary Summarized Action */}
      <Link
        to={builderPath}
        className="btn btn-primary btn-sm"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.35rem 0.75rem",
          fontSize: "0.825rem",
          fontWeight: 600,
          borderRadius: "6px",
          textDecoration: "none",
        }}
      >
        <Wrench size={13} />
        <span>{isAdmin ? "Curriculum" : "Builder"}</span>
      </Link>

      {/* Summarized Actions Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-secondary btn-sm"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.35rem 0.55rem",
          fontSize: "0.825rem",
          borderRadius: "6px",
          background: isOpen ? "var(--bg-subtle)" : "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
        title="More course options"
        aria-expanded={isOpen}
      >
        <MoreHorizontal size={15} />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            zIndex: 100,
            minWidth: "185px",
            background: "var(--bg-surface)",
            borderRadius: "10px",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--border-color)",
            padding: "0.35rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
          }}
        >
          {!isAdmin && (
            <Link
              to={`/instructor/courses/${course.id}/edit`}
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.45rem 0.75rem",
                fontSize: "0.825rem",
                color: "var(--text-secondary)",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Edit3 size={14} style={{ color: "var(--slate-400)" }} />
              <span>Edit Details</span>
            </Link>
          )}

          <Link
            to={`/courses/${course.id}/preview`}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 0.75rem",
              fontSize: "0.825rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Eye size={14} style={{ color: "var(--slate-400)" }} />
            <span>Preview Course</span>
          </Link>

          <Link
            to={`/instructor/courses/${course.id}/builder#certificates`}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 0.75rem",
              fontSize: "0.825rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Award size={14} style={{ color: "var(--success)" }} />
            <span>Certificates</span>
          </Link>

          <Link
            to={`/my-courses/${course.id}/assignments`}
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 0.75rem",
              fontSize: "0.825rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <CheckSquare size={14} style={{ color: "var(--primary)" }} />
            <span>Assignments</span>
          </Link>

          {!isAdmin && (
            <>
              <div style={{ height: "1px", background: "var(--border-color)", margin: "0.25rem 0" }} />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDelete(course.id, course.title);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.45rem 0.75rem",
                  fontSize: "0.825rem",
                  color: "var(--danger)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Trash2 size={14} />
                <span>Delete Course</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function InstructorCourseListPage() {
  const { access, role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!access) return;
    setLoading(true);

    listPublishedCourses({ page_size: 100, mine: "true" }, access)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setCourses(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load courses.");
      })
      .finally(() => setLoading(false));
  }, [access]);

  async function handleDeleteCourse(courseId, courseTitle) {
    if (
      !window.confirm(
        `Are you sure you want to delete "${courseTitle}"? This will permanently remove all lessons, quizzes, and course data.`
      )
    )
      return;
    try {
      await deleteCourse(courseId, access);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      setError(err.message || "Failed to delete course.");
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (statusFilter === "published") return course.status === "published";
    if (statusFilter === "draft") return course.status === "draft";
    return true;
  });

  const columns = [
    {
      header: "Course",
      accessor: "title",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={getMediaUrl(row.thumbnail || row.image)}
            alt={row.title}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-sm)",
              objectFit: "cover",
              border: "1px solid var(--border-color)",
              flexShrink: 0,
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
            }}
          />
          <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{row.title}</strong>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      cell: (row) => row.category || "Uncategorized",
    },
    {
      header: "Price",
      accessor: "price",
      cell: (row) => (Number(row.price || 0) > 0 ? formatCurrency(row.price) : "Free"),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <CourseActionsDropdown course={row} isAdmin={isAdmin} onDelete={handleDeleteCourse} />
      ),
    },
  ];

  const draftCount = courses.filter((c) => c.status === "draft").length;
  const publishedCount = courses.filter((c) => c.status === "published").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", margin: 0, letterSpacing: "-0.02em" }}>
            {isAdmin ? "Course Catalog Supervision" : "My Courses & Curriculum"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", fontSize: "0.925rem" }}>
            {isAdmin
              ? "Inspect curriculum modules, lesson video contents, and publication status."
              : "Manage, build, and publish your interactive course curriculum."}
          </p>
        </div>
        {!isAdmin && (
          <Link
            to="/instructor/courses/create"
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <PlusCircle size={16} />
            <span>Create Course</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="tabs-ui">
        <button
          type="button"
          className={`tab-item ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <span>All Courses</span>
          <span className="tab-badge">{courses.length}</span>
        </button>

        <button
          type="button"
          className={`tab-item ${statusFilter === "published" ? "active" : ""}`}
          onClick={() => setStatusFilter("published")}
        >
          <span>Published</span>
          <span className="tab-badge">{publishedCount}</span>
        </button>

        <button
          type="button"
          className={`tab-item ${statusFilter === "draft" ? "active" : ""}`}
          onClick={() => setStatusFilter("draft")}
        >
          <span>Drafts</span>
          <span className="tab-badge">{draftCount}</span>
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title={
            statusFilter === "draft"
              ? "No draft courses"
              : statusFilter === "published"
              ? "No published courses"
              : "No courses created yet"
          }
          description="Start sharing your knowledge by building your first online course!"
          actionText={!isAdmin ? "Create Course" : undefined}
          actionLink={!isAdmin ? "/instructor/courses/create" : undefined}
          icon="📚"
        />
      ) : (
        <DataTable columns={columns} data={filteredCourses} keyField="id" />
      )}
    </div>
  );
}
