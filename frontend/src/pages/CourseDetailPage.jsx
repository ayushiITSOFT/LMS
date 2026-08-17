import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { deleteCourse, getCourse } from "../features/courses/courseService.js";

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access, role, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

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

  const canManage =
    role === ROLES.ADMIN || (role === ROLES.INSTRUCTOR && course?.instructor === user?.id);

  async function handleDelete() {
    if (!window.confirm("Delete this course?")) return;

    try {
      await deleteCourse(id, access);
      navigate("/courses", { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to delete course.");
    }
  }

  if (status === "loading") {
    return <p className="page-message">Loading course...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>{course.title}</h1>
          <p>{course.subtitle || course.category}</p>
        </div>
        {canManage ? (
          <div className="actions">
            <Link className="button-link" to={`/courses/${course.id}/edit`}>
              Edit
            </Link>
            <Link className="button-link" to={`/courses/${course.id}/builder`}>
              Builder
            </Link>
            <button className="danger-button" onClick={handleDelete} type="button">
              Delete
            </button>
          </div>
        ) : null}
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      <dl className="detail-list">
        <div>
          <dt>Category</dt>
          <dd>{course.category}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{course.level}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>{course.language}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{course.status}</dd>
        </div>
      </dl>
      <p>{course.description || "No description provided."}</p>
    </section>
  );
}
