import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate(`/courses/${course.id}`, { replace: true });
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to create course.");
    }
  }

  return (
    <section className="auth-page">
      <h1>Create course</h1>
      {message ? <p className="form-error">{message}</p> : null}
      <CourseForm errors={errors} onSubmit={handleSubmit} submitLabel="Create course" />
    </section>
  );
}
