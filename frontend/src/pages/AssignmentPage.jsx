import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { getStudentDashboard, getEnrollment } from "../features/enrollment/enrollmentService.js";
import {
  createAssignmentSubmission,
  getAssignment,
  getAssignmentSubmission,
  listAssignments,
  updateAssignmentSubmission,
} from "../features/assignments/assignmentService.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "Not set";
}

function statusLabel(value) {
  if (!value) return "Not started";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function mergeAssignments(assignments, deadlines) {
  const merged = new Map();

  assignments.forEach((assignment) => {
    merged.set(Number(assignment.id), assignment);
  });

  deadlines.forEach((deadline) => {
    if (!merged.has(Number(deadline.assignment_id))) {
      merged.set(Number(deadline.assignment_id), {
        id: deadline.assignment_id,
        title: deadline.title,
        course: deadline.course_id,
        due_date: deadline.due_date,
        status: deadline.status,
      });
    }
  });

  return [...merged.values()].sort((left, right) => {
    const leftTime = left.due_date ? new Date(left.due_date).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.due_date ? new Date(right.due_date).getTime() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime || Number(left.id) - Number(right.id);
  });
}

export function AssignmentPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { access } = useAuth();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState(assignmentId ? Number(assignmentId) : null);
  const [status, setStatus] = useState("loading");
  const [listStatus, setListStatus] = useState("loading");
  const [detailStatus, setDetailStatus] = useState("loading");
  const [submissionStatus, setSubmissionStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [listMessage, setListMessage] = useState("");
  const [detailMessage, setDetailMessage] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    getEnrollment(courseId, access)
      .then((data) => {
        if (!active) return;
        setCourse(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to access this course.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, courseId]);

  useEffect(() => {
    if (status !== "ready") return;

    let active = true;
    setListStatus("loading");
    setListMessage("");

    Promise.allSettled([listAssignments(courseId, access), getStudentDashboard(access)]).then(
      ([assignmentResult, dashboardResult]) => {
        if (!active) return;

        const dashboardAssignments =
          dashboardResult.status === "fulfilled"
            ? dashboardResult.value.upcoming_deadlines || []
            : [];
        const assignmentList =
          assignmentResult.status === "fulfilled"
            ? itemsFrom(assignmentResult.value)
            : [];

        if (assignmentResult.status === "rejected" && dashboardResult.status === "rejected") {
          setListMessage(assignmentResult.reason?.message || dashboardResult.reason?.message || "Unable to load assignments.");
        } else if (assignmentResult.status === "rejected") {
          setListMessage(assignmentResult.reason?.message || "Assignments list is unavailable.");
        }

        setAssignments(
          mergeAssignments(assignmentList, dashboardAssignments.filter((item) => Number(item.course_id) === Number(courseId)))
        );
        setListStatus("ready");
      }
    );

    return () => {
      active = false;
    };
  }, [access, courseId, status]);

  useEffect(() => {
    if (!assignments.length) return;
    const nextSelected = assignmentId ? Number(assignmentId) : Number(assignments[0].id);
    setSelectedId(nextSelected);
  }, [assignmentId, assignments]);

  useEffect(() => {
    if (!selectedId) {
      setAssignment(null);
      setSubmission(null);
      setContent("");
      setDetailStatus("ready");
      setSubmissionStatus("ready");
      return;
    }

    let active = true;
    setDetailStatus("loading");
    setSubmissionStatus("loading");
    setDetailMessage("");
    setSubmissionMessage("");

    const summary = assignments.find((item) => Number(item.id) === Number(selectedId)) || null;

    getAssignment(courseId, selectedId, access)
      .then((data) => {
        if (!active) return;
        setAssignment(data);
        setDetailStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setAssignment(summary);
        setDetailMessage(error.message || "Assignment details are unavailable.");
        setDetailStatus("error");
      });

    getAssignmentSubmission(courseId, selectedId, access)
      .then((data) => {
        if (!active) return;
        setSubmission(data);
        setContent(data?.content || "");
        setSubmissionStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setSubmission(null);
        setSubmissionMessage(error.message || "Unable to load your submission.");
        setSubmissionStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, assignments, courseId, selectedId]);

  const activeAssignment = useMemo(
    () => assignment || assignments.find((item) => Number(item.id) === Number(selectedId)) || null,
    [assignment, assignments, selectedId]
  );

  async function persistSubmission(nextStatus) {
    if (!selectedId) return;
    const trimmed = content.trim();

    if (nextStatus === "submitted" && !trimmed) {
      setValidationError("Add your submission text before submitting.");
      return;
    }

    setSubmitting(true);
    setValidationError("");
    setSubmissionMessage("");

    const payload = {
      content,
      status: nextStatus,
    };

    if (nextStatus === "submitted") {
      payload.submitted_at = new Date().toISOString();
    }

    try {
      const saved = submission?.id
        ? await updateAssignmentSubmission(courseId, selectedId, submission.id, payload, access)
        : await createAssignmentSubmission(courseId, selectedId, payload, access);
      setSubmission(saved);
      setContent(saved.content || "");
      setAssignments((current) =>
        current.map((item) =>
          Number(item.id) === Number(selectedId) ? { ...item, status: saved.status } : item
        )
      );
    } catch (error) {
      setSubmissionMessage(error.message || "Unable to save submission.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <p className="page-message">Loading assignments...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>{course.course?.title || "Course assignments"}</h1>
          <p>{course.course?.subtitle || "Assignments and submissions for your enrolled course."}</p>
        </div>
        <div className="actions">
          <Link className="button-link" to={`/my-courses/${courseId}`}>
            Back to course
          </Link>
          <Link className="button-link" to="/my-courses">
            All courses
          </Link>
        </div>
      </div>

      {listMessage ? <p className="form-error">{listMessage}</p> : null}

      <div className="learning-layout assignment-layout">
        <aside className="builder-panel">
          <h2>Assignments</h2>
          {listStatus === "loading" ? (
            <p className="page-message">Loading assignment list...</p>
          ) : assignments.length ? (
            assignments.map((item) => (
              <button
                className={`lesson-button ${Number(item.id) === Number(selectedId) ? "active" : ""}`}
                key={item.id}
                onClick={() => {
                  setSelectedId(Number(item.id));
                  navigate(`/my-courses/${courseId}/assignments/${item.id}`, { replace: true });
                }}
                type="button"
              >
                <strong>{item.title}</strong>
                <small>{item.due_date ? formatDateTime(item.due_date) : "No due date"}</small>
              </button>
            ))
          ) : (
            <p className="page-message">No assignments are available yet.</p>
          )}
        </aside>

        <article className="builder-panel">
          {activeAssignment ? (
            <>
              <div className="assignment-header">
                <div>
                  <small>Assignment</small>
                  <h2>{activeAssignment.title}</h2>
                </div>
                <span className={`status-pill status-${activeAssignment.status || "draft"}`}>
                  {statusLabel(activeAssignment.status)}
                </span>
              </div>

              <dl className="detail-list">
                <div>
                  <dt>Due</dt>
                  <dd>{activeAssignment.due_date ? formatDateTime(activeAssignment.due_date) : "Not set"}</dd>
                </div>
                <div>
                  <dt>Max score</dt>
                  <dd>{activeAssignment.max_score ?? "Not set"}</dd>
                </div>
                <div>
                  <dt>Submission</dt>
                  <dd>{statusLabel(submission?.status)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDateTime(submission?.updated_at)}</dd>
                </div>
              </dl>

              {detailMessage ? <p className="form-error">{detailMessage}</p> : null}
              {submissionMessage ? <p className="form-error">{submissionMessage}</p> : null}

              <section className="assignment-section">
                <h3>Instructions</h3>
                {detailStatus === "loading" ? (
                  <p className="page-message">Loading assignment details...</p>
                ) : assignment?.instructions ? (
                  <p>{assignment.instructions}</p>
                ) : (
                  <p className="page-message">No instructions were published for this assignment.</p>
                )}
              </section>

              <section className="assignment-section">
                <h3>Your work</h3>
                {submissionStatus === "loading" ? (
                  <p className="page-message">Loading your submission...</p>
                ) : null}
                <form
                  className="auth-form assignment-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    persistSubmission("submitted");
                  }}
                  noValidate
                >
                  <label>
                    Submission text
                    <textarea
                      name="content"
                      onChange={(event) => setContent(event.target.value)}
                      rows="10"
                      value={content}
                    />
                  </label>
                  {validationError ? <span className="field-error">{validationError}</span> : null}
                  {submission?.score !== undefined && submission?.score !== null ? (
                    <dl className="detail-list">
                      <div>
                        <dt>Score</dt>
                        <dd>
                          {submission.score}/{activeAssignment.max_score ?? "?"}
                        </dd>
                      </div>
                      <div>
                        <dt>Feedback</dt>
                        <dd>{submission.feedback || "No feedback yet."}</dd>
                      </div>
                    </dl>
                  ) : null}
                  <div className="actions">
                    <button
                      className="button-link"
                      disabled={submitting}
                      onClick={() => persistSubmission("draft")}
                      type="button"
                    >
                      {submitting ? "Saving..." : "Save draft"}
                    </button>
                    <button className="cart-button" disabled={submitting} type="submit">
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </section>
            </>
          ) : (
            <p className="page-message">Select an assignment to review the instructions and submit work.</p>
          )}
        </article>
      </div>
    </section>
  );
}
