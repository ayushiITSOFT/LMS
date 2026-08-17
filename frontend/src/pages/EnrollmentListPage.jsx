import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listEnrollments } from "../features/enrollment/enrollmentService.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

export function EnrollmentListPage() {
  const { access } = useAuth();
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    listEnrollments(access)
      .then((data) => {
        if (!active) return;
        setCourses(itemsFrom(data));
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load enrollments.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access]);

  if (status === "loading") return <p className="page-message">Loading enrolled courses...</p>;
  if (status === "error") return <p className="form-error">{message}</p>;

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>My Courses</h1>
          <p>Courses authorized for your account by the backend.</p>
        </div>
        <Link className="button-link" to="/courses">Browse courses</Link>
      </div>
      {courses.length === 0 ? <p className="page-message">You are not enrolled in any courses.</p> : null}
      {courses.length ? (
        <div className="course-grid">
          {courses.map((enrollment) => {
            const course = enrollment.course || {};
            return (
              <article className="course-card" key={enrollment.id}>
                <div>
                  <small>{course.level || "Course"}</small>
                  <h2>{course.title || enrollment.course_title || `Course #${enrollment.course}`}</h2>
                  <p>{course.subtitle || "Enrolled course"}</p>
                </div>
                <dl className="detail-list">
                  <div><dt>Status</dt><dd>Enrolled</dd></div>
                  <div><dt>Enrolled</dt><dd>{new Date(enrollment.created_at).toLocaleDateString()}</dd></div>
                </dl>
                <div className="course-card-footer">
                  <span>Authorized course</span>
                  <Link to={`/my-courses/${course.id || enrollment.course}`}>Open course</Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
