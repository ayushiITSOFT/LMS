import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { getCoursePreview } from "../features/courses/courseService.js";

function formatPrice(price) {
  return Number(price || 0) > 0 ? `$${Number(price).toFixed(2)}` : "Free";
}

function LessonContent({ lesson }) {
  return (
    <div className="preview-content">
      {lesson.video_url ? (
        <p>
          Video: <a href={lesson.video_url}>{lesson.video_url}</a>
        </p>
      ) : null}
      {lesson.pdf ? (
        <p>
          PDF: <a href={lesson.pdf}>Open PDF</a>
        </p>
      ) : null}
      {lesson.notes ? <p>{lesson.notes}</p> : null}
      {!lesson.video_url && !lesson.pdf && !lesson.notes ? (
        <p className="page-message">No preview content available.</p>
      ) : null}
    </div>
  );
}

export function CoursePreviewPage() {
  const { id } = useParams();
  const { access } = useAuth();
  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [activeLessonId, setActiveLessonId] = useState(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    getCoursePreview(id, access)
      .then((data) => {
        if (!active) return;
        setCourse(data);
        setActiveLessonId(data.sections?.[0]?.lessons?.[0]?.id || null);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load course preview.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, id]);

  const activeLesson = useMemo(() => {
    if (!course || !activeLessonId) return null;

    return course.sections
      ?.flatMap((section) => section.lessons || [])
      .find((lesson) => lesson.id === activeLessonId);
  }, [activeLessonId, course]);

  if (status === "loading") return <p className="page-message">Loading preview...</p>;
  if (status === "error") return <p className="form-error">{message}</p>;

  return (
    <section className="content-page preview-page">
      <div className="page-heading">
        <div>
          <span className="preview-badge">Preview</span>
          <h1>{course.title}</h1>
          <p>{course.subtitle || course.category}</p>
        </div>
        <div className="actions">
          <Link className="button-link" to={`/courses/${id}/builder`}>
            Builder
          </Link>
          <Link className="button-link" to={`/courses/${id}`}>
            Course detail
          </Link>
        </div>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Price</dt>
          <dd>{formatPrice(course.price)}</dd>
        </div>
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
      {course.sections?.length ? (
        <div className="preview-layout">
          <nav className="preview-nav" aria-label="Course preview">
            {course.sections.map((section) => (
              <div key={section.id}>
                <h2>{section.title}</h2>
                {section.lessons?.length ? (
                  section.lessons.map((lesson) => (
                    <button
                      className={lesson.id === activeLessonId ? "active" : ""}
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      type="button"
                    >
                      {lesson.title}
                    </button>
                  ))
                ) : (
                  <p className="page-message">No preview lessons.</p>
                )}
              </div>
            ))}
          </nav>
          <article className="preview-lesson">
            {activeLesson ? (
              <>
                <small>{activeLesson.kind}</small>
                <h2>{activeLesson.title}</h2>
                <LessonContent lesson={activeLesson} />
              </>
            ) : (
              <p className="page-message">Select a lesson to preview.</p>
            )}
          </article>
        </div>
      ) : (
        <p className="page-message">No previewable sections or lessons are available.</p>
      )}
    </section>
  );
}
