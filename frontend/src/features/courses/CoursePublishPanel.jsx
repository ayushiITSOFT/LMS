import { useState } from "react";
import { publishCourse } from "./courseService.js";

function flattenErrors(errors = {}) {
  return Object.entries(errors).flatMap(([field, messages]) => {
    const values = Array.isArray(messages) ? messages : [messages];
    return values.map((message) => `${field}: ${message}`);
  });
}

export function CoursePublishPanel({ course, onPublished, token }) {
  const [errors, setErrors] = useState(course.publish_errors || {});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [submitting, setSubmitting] = useState(false);
  const isPublished = course.status === "published";

  async function handlePublish() {
    if (!window.confirm("Publish this course?")) return;

    setSubmitting(true);
    setMessage("");

    try {
      const updated = await publishCourse(course.id, token);
      setErrors({});
      setMessage("Course published.");
      setMessageType("success");
      onPublished(updated);
    } catch (error) {
      setErrors(error.data?.errors || error.data || {});
      setMessage(error.message || "Unable to publish course.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  const readinessErrors = flattenErrors(errors);

  return (
    <section className="builder-panel">
      <div className="publish-heading">
        <div>
          <h2>Publishing</h2>
          <p className="page-message">
            Status: <span className={`status-pill status-${course.status}`}>{course.status}</span>
          </p>
        </div>
        <button disabled={submitting || isPublished} onClick={handlePublish} type="button">
          {submitting ? "Publishing..." : isPublished ? "Published" : "Publish"}
        </button>
      </div>
      {message ? (
        <p className={messageType === "success" ? "form-success" : "form-error"}>
          {message}
        </p>
      ) : null}
      {isPublished ? (
        <p className="page-message">This course is published.</p>
      ) : readinessErrors.length ? (
        <ul className="error-list">
          {readinessErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        <p className="page-message">
          Backend validation will run before this course is published.
        </p>
      )}
    </section>
  );
}
