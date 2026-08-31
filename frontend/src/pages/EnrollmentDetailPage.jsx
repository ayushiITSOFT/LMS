import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import {
  completeLesson,
  getEnrollment,
  getResumeLesson,
} from "../features/enrollment/enrollmentService.js";

export function EnrollmentDetailPage() {
  const { id } = useParams();
  const { access } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completionStatus, setCompletionStatus] = useState("ready");

  useEffect(() => {
    let active = true;
    Promise.all([getEnrollment(id, access), getResumeLesson(id, access)])
      .then(([data, resume]) => {
        if (!active) return;
        setEnrollment(data);
        const resumeId = resume?.lesson?.id;
        const firstLesson = data.sections?.flatMap((section) => section.lessons || [])[0];
        setSelectedLesson(
          data.sections
            ?.flatMap((section) => section.lessons || [])
            .find((lesson) => lesson.id === resumeId) || firstLesson || null
        );
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

  async function handleComplete() {
    if (!selectedLesson || selectedLesson.completed) return;
    setCompletionStatus("loading");
    setMessage("");

    try {
      await completeLesson(id, selectedLesson.id, access);
      const updated = await getEnrollment(id, access);
      setEnrollment(updated);
      setSelectedLesson(
        updated.sections
          ?.flatMap((section) => section.lessons || [])
          .find((lesson) => lesson.id === selectedLesson.id) || selectedLesson
      );
      setCompletionStatus("ready");
    } catch (error) {
      setMessage(error.message || "Unable to update lesson progress.");
      setCompletionStatus("error");
    }
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>{course.title || "Enrolled course"}</h1>
          <p>{course.subtitle || "Authorized course access"}</p>
        </div>
        <div className="actions">
          <Link className="button-link" to={`/my-courses/${id}/assignments`}>
            Assignments
          </Link>
          <Link className="button-link" to="/my-courses">
            All My Courses
          </Link>
        </div>
      </div>
      <dl className="detail-list">
        <div><dt>Progress</dt><dd>{enrollment.progress_percentage}%</dd></div>
        <div><dt>Status</dt><dd>{enrollment.course_completed ? "Completed" : "In progress"}</dd></div>
        <div><dt>Enrolled</dt><dd>{new Date(enrollment.created_at).toLocaleDateString()}</dd></div>
      </dl>
      {message ? <p className="form-error">{message}</p> : null}
      {enrollment.sections?.length ? (
        <div className="learning-layout">
          <aside className="builder-panel">
            <h2>Lessons</h2>
            {enrollment.sections.map((section) => (
              <div key={section.id}>
                <h3>{section.title}</h3>
                {section.lessons?.map((lesson) => (
                  <button
                    className="lesson-button"
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    type="button"
                  >
                    {lesson.completed ? "Completed: " : ""}{lesson.title}
                  </button>
                ))}
              </div>
            ))}
          </aside>
          <article className="builder-panel">
            {selectedLesson ? (
              <>
                <h2>{selectedLesson.title}</h2>
                <p>Type: {selectedLesson.kind}</p>
                {selectedLesson.video_url ? <p><a href={selectedLesson.video_url}>Open video</a></p> : null}
                {selectedLesson.pdf ? <p><a href={selectedLesson.pdf}>Open PDF</a></p> : null}
                {selectedLesson.notes ? <p>{selectedLesson.notes}</p> : null}
                <button
                  className="button-link"
                  disabled={selectedLesson.completed || completionStatus === "loading"}
                  onClick={handleComplete}
                  type="button"
                >
                  {selectedLesson.completed
                    ? "Lesson completed"
                    : completionStatus === "loading"
                      ? "Saving..."
                      : "Mark lesson complete"}
                </button>
              </>
            ) : <p className="page-message">Select a lesson to begin.</p>}
          </article>
        </div>
      ) : <p className="page-message">No course sections are available yet.</p>}
    </section>
  );
}
