import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { getEnrollment } from "../features/enrollment/enrollmentService.js";

export function EnrollmentDetailPage() {
  const { id } = useParams();
  const { access } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getEnrollment(id, access)
      .then((data) => {
        if (!active) return;
        setEnrollment(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to access this course.");
        setStatus("error");
      });
    return () => { active = false; };
  }, [access, id]);

  if (status === "loading") return <p className="page-message">Checking course access...</p>;
  if (status === "error") return <p className="form-error">{message}</p>;

  const course = enrollment.course || {};

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>{course.title || "Enrolled course"}</h1>
          <p>{course.subtitle || "Authorized course access"}</p>
        </div>
        <Link className="button-link" to="/my-courses">All My Courses</Link>
      </div>
      <dl className="detail-list">
        <div><dt>Status</dt><dd>Enrolled</dd></div>
        <div><dt>Enrolled</dt><dd>{new Date(enrollment.created_at).toLocaleDateString()}</dd></div>
      </dl>
      <p>{course.description || "Course content is available through the authorized course access endpoint."}</p>
      {enrollment.sections?.length ? (
        <div className="builder-panel">
          <h2>Course contents</h2>
          {enrollment.sections.map((section) => (
            <div key={section.id}>
              <h3>{section.title}</h3>
              <p>{section.lessons?.length || 0} lessons</p>
            </div>
          ))}
        </div>
      ) : <p className="page-message">No course sections are available yet.</p>}
    </section>
  );
}
