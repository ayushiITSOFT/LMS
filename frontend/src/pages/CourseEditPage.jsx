import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { CourseForm } from "../features/courses/CourseForm.jsx";
import { getCourse, updateCourse } from "../features/courses/courseService.js";

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
      setMessage(error.message || "Unable to update course.");
    }
  }

  if (status === "loading") {
    return <p className="page-message">Loading course...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="auth-page">
      <h1>Edit course</h1>
      {message ? <p className="form-error">{message}</p> : null}
      <CourseForm
        errors={errors}
        initialCourse={course}
        onSubmit={handleSubmit}
        submitLabel="Update course"
      />
    </section>
  );
}
