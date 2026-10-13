import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, AlertCircle, Trash2 } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { CourseForm } from "../features/courses/CourseForm.jsx";
import { deleteCourse, getCourse, updateCourse } from "../features/courses/courseService.js";
import { Skeleton } from "../components/Skeleton.jsx";

export function CourseEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access } = useAuth();
  const [course, setCourse] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    getCourse(id, access)
      .then((data) => {
        if (!active) return;
        setCourse(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load course.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, id]);

  async function handleSubmit(values) {
    setErrors({});
    setMessage("");

    try {
      const updated = await updateCourse(id, values, access);
      navigate(`/courses/${updated.id}`, { replace: true });
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to update course. Please check the highlighted fields.");
    }
  }

  async function handleDeleteCourse() {
    if (!window.confirm(`Are you sure you want to delete "${course?.title || "this course"}"? This action cannot be undone.`)) return;
    try {
      await deleteCourse(id, access);
      navigate("/instructor/courses", { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to delete course.");
    }
  }

  if (status === "loading") {
    return (
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "1.5rem 0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Skeleton height="32px" width="200px" />
        <Skeleton height="350px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "2rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.25rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger-border)" }}>
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700 }}>Error Loading Course</div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.2rem" }}>{message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-edit-container" style={{ maxWidth: "880px", margin: "0 auto", padding: "1rem 0" }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <Link
            to="/instructor/courses"
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex" }}
          >
            <ArrowLeft size={16} />
            <span>Back to Instructor Studio</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteCourse}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={14} />
            <span>Delete Course</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Edit3 size={24} />
          </div>
          <div>
            <h1 className="h2" style={{ margin: 0 }}>Edit Course Details</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: "0.2rem 0 0 0" }}>
              Update course metadata, pricing, or specifications for <strong style={{ color: "var(--text-main)" }}>"{course?.title}"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Global Error Message */}
      {message && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger-border)", marginBottom: "1.5rem" }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.925rem", fontWeight: 600 }}>{message}</span>
        </div>
      )}

      {/* Course Form Component */}
      <CourseForm
        errors={errors}
        initialCourse={course}
        onSubmit={handleSubmit}
        submitLabel="Update Course"
      />
    </div>
  );
}
