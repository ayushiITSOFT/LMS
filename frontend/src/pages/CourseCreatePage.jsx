import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { CourseForm } from "../features/courses/CourseForm.jsx";
import { createCourse } from "../features/courses/courseService.js";

export function CourseCreatePage() {
  const navigate = useNavigate();
  const { access } = useAuth();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  async function handleSubmit(values) {
    setErrors({});
    setMessage("");

    try {
      const course = await createCourse(values, access);
      navigate(`/instructor/courses/${course.id}/builder`, { replace: true });
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to create course. Please review the highlighted fields.");
    }
  }

  return (
    <div className="course-create-container" style={{ maxWidth: "880px", margin: "0 auto", padding: "1rem 0" }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Link
          to="/instructor/courses"
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: "1rem", display: "inline-flex" }}
        >
          <ArrowLeft size={16} />
          <span>Back to Instructor Studio</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookPlus size={24} />
          </div>
          <div>
            <h1 className="h2" style={{ margin: 0 }}>Create New Course</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: "0.2rem 0 0 0" }}>
              Publish a new course to your curriculum and make it accessible to students worldwide.
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
      <CourseForm errors={errors} onSubmit={handleSubmit} submitLabel="Create & Launch Course" />
    </div>
  );
}
