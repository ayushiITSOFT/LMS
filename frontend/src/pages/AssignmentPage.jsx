import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  File,
  Video,
  ExternalLink,
  Download,
  CheckSquare,
  Clock,
  Award,
  Send,
  Save,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Users,
  Check,
  Edit3,
  MessageSquare,
  FileCheck,
  Wrench,
} from "lucide-react";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { getMediaUrl } from "../utils/mediaUrl.js";
import { getStudentDashboard, getEnrollment } from "../features/enrollment/enrollmentService.js";
import { getCourse } from "../features/courses/courseService.js";
import {
  createAssignmentSubmission,
  getAssignment,
  getAssignmentSubmission,
  listAssignments,
  listAssignmentSubmissions,
  updateAssignmentSubmission,
  gradeAssignmentSubmission,
} from "../features/assignments/assignmentService.js";

function getEmbedUrl(url) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
}

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
  const { access, role } = useAuth();
  const isManager = role === ROLES.INSTRUCTOR || role === ROLES.ADMIN;
  const isAdmin = role === ROLES.ADMIN;

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
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Instructor / Admin Submissions state
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeScore, setGradeScore] = useState(100);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradeSaving, setGradeSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    const fetchCourseData = getEnrollment(courseId, access).catch(() =>
      getCourse(courseId, access).then((res) => ({ course: res }))
    );

    fetchCourseData
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
      setAllSubmissions([]);
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

    if (!isManager) {
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
    } else {
      setSubmissionStatus("ready");
    }

    if (isManager) {
      setSubmissionsLoading(true);
      listAssignmentSubmissions(courseId, selectedId, access)
        .then((subs) => {
          if (!active) return;
          setAllSubmissions(subs);
        })
        .catch(() => {
          if (!active) return;
          setAllSubmissions([]);
        })
        .finally(() => {
          if (!active) return;
          setSubmissionsLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [access, assignments, courseId, isManager, selectedId]);

  const activeAssignment = useMemo(
    () => assignment || assignments.find((item) => Number(item.id) === Number(selectedId)) || null,
    [assignment, assignments, selectedId]
  );

  async function handleSaveGrade(subId) {
    if (!selectedId || !subId) return;
    setGradeSaving(true);
    try {
      const updated = await gradeAssignmentSubmission(
        courseId,
        selectedId,
        subId,
        { score: Number(gradeScore), feedback: gradeFeedback.trim() },
        access
      );
      setAllSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, score: updated.score, feedback: updated.feedback, status: updated.status } : s))
      );
      setGradingSubId(null);
    } catch (err) {
      alert(err.message || "Failed to grade submission.");
    } finally {
      setGradeSaving(false);
    }
  }

  async function persistSubmission(nextStatus) {
    if (!selectedId) return;
    const trimmed = content.trim();

    if (nextStatus === "submitted" && !trimmed && !submissionFile && !submission?.file) {
      setValidationError("Please add submission text or attach a project file before submitting.");
      return;
    }

    setSubmitting(true);
    setValidationError("");
    setSubmissionMessage("");

    const payload = {
      content,
      status: nextStatus,
    };
    if (submissionFile) {
      payload.file = submissionFile;
    }

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
    return (
      <div className="assignment-container">
        <p style={{ color: "var(--text-muted)" }}>Loading assignment workspace...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="assignment-container">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger-border)" }}>
          <AlertCircle size={20} />
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-container">
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link to={`/my-courses/${courseId}`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex" }}>
            <ArrowLeft size={16} />
            <span>Back to Learn Page</span>
          </Link>
          {isManager && (
            <Link to={`/instructor/courses/${courseId}/builder`} className="btn btn-outline btn-sm" style={{ display: "inline-flex" }}>
              <Wrench size={16} />
              <span>Course Builder</span>
            </Link>
          )}
        </div>

        <Link to="/my-courses" className="btn btn-outline">
          <BookOpen size={16} />
          <span>My Enrolled Courses</span>
        </Link>
      </div>

      {listMessage && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", marginBottom: "1.5rem" }}>
          {listMessage}
        </div>
      )}

      {/* Grid Layout: Sidebar & Main Workspace */}
      <div className="assignment-grid-layout">
        {/* Sidebar Panel */}
        <aside className="assignment-sidebar-card">
          <div className="assignment-sidebar-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckSquare size={18} style={{ color: "var(--primary)" }} />
              <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>Assignments ({assignments.length})</strong>
            </div>
          </div>

          <div className="assignment-sidebar-list">
            {listStatus === "loading" ? (
              <p style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading list...</p>
            ) : assignments.length ? (
              assignments.map((item) => {
                const isSelected = Number(item.id) === Number(selectedId);
                return (
                  <button
                    key={item.id}
                    className={`assignment-nav-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedId(Number(item.id));
                      navigate(`/my-courses/${courseId}/assignments/${item.id}`, { replace: true });
                    }}
                    type="button"
                  >
                    <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: "0.9rem", color: isSelected ? "var(--primary)" : "var(--text-main)" }}>
                      {item.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} />
                        {item.due_date ? new Date(item.due_date).toLocaleDateString() : "No Due Date"}
                      </span>
                      {item.status && (
                        <span className={`badge-ui ${item.status === "published" ? "badge-success" : "badge-info"}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <p style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>No assignments published yet.</p>
            )}
          </div>
        </aside>

        {/* Main Stage Workspace */}
        <div className="assignment-main-stage">
          {activeAssignment ? (
            <>
              {/* Assignment Title & Meta Header Card */}
              <div className="ui-card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <span className="badge-ui badge-info" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
                      Project Assignment
                    </span>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                      {activeAssignment.title}
                    </h2>
                  </div>
                  <span className={`badge-ui ${submission?.status === "submitted" || submission?.status === "graded" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}>
                    {statusLabel(submission?.status)}
                  </span>
                </div>

                {/* Metadata Stats Grid */}
                <div className="assignment-meta-grid">
                  <div className="assignment-meta-box">
                    <span className="assignment-meta-label">
                      <Clock size={13} />
                      Due Date
                    </span>
                    <span className="assignment-meta-val">
                      {activeAssignment.due_date ? formatDateTime(activeAssignment.due_date) : "No Due Date"}
                    </span>
                  </div>

                  <div className="assignment-meta-box">
                    <span className="assignment-meta-label">
                      <Award size={13} />
                      Max Score
                    </span>
                    <span className="assignment-meta-val">
                      {activeAssignment.max_score ?? 100} Points
                    </span>
                  </div>

                  <div className="assignment-meta-box">
                    <span className="assignment-meta-label">
                      <FileCheck size={13} />
                      My Submission
                    </span>
                    <span className="assignment-meta-val" style={{ color: submission?.status === "graded" ? "var(--success)" : "var(--text-main)" }}>
                      {statusLabel(submission?.status)}
                    </span>
                  </div>

                  <div className="assignment-meta-box">
                    <span className="assignment-meta-label">
                      <Clock size={13} />
                      Last Updated
                    </span>
                    <span className="assignment-meta-val" style={{ fontSize: "0.85rem" }}>
                      {formatDateTime(submission?.updated_at)}
                    </span>
                  </div>
                </div>

                {detailMessage && (
                  <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", fontSize: "0.85rem", marginTop: "1rem" }}>
                    {detailMessage}
                  </div>
                )}
              </div>

              {/* Instructions & Question Material Card */}
              <div className="ui-card">
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={20} style={{ color: "var(--primary)" }} />
                  <span>Instructions & Question Brief</span>
                </h3>

                {detailStatus === "loading" ? (
                  <p style={{ color: "var(--text-muted)" }}>Loading assignment instructions...</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Text Instructions */}
                    {assignment?.instructions && (
                      <div style={{ whiteSpace: "pre-line", lineHeight: 1.65, fontSize: "0.95rem", color: "var(--text-main)", background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                        {assignment.instructions}
                      </div>
                    )}

                    {/* Video Instruction Attachment */}
                    {(assignment?.attachment_type === "video" || assignment?.video_url) && (
                      <div style={{ background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
                          <Video size={18} />
                          <span>Video Brief & Walkthrough</span>
                        </div>
                        {getEmbedUrl(assignment.video_url) ? (
                          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <iframe
                              src={getEmbedUrl(assignment.video_url)}
                              title={assignment.title || "Assignment Video"}
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                              allowFullScreen
                            />
                          </div>
                        ) : assignment.video_url ? (
                          <a
                            href={assignment.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                          >
                            <ExternalLink size={16} />
                            <span>Watch Video Instructions ({assignment.video_url})</span>
                          </a>
                        ) : null}
                      </div>
                    )}

                    {/* PDF Question Document Attachment */}
                    {(assignment?.attachment_type === "pdf" || assignment?.pdf_file) && (
                      <div style={{ background: "var(--bg-subtle)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <File size={20} />
                            </div>
                            <div>
                              <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>Question PDF Document</strong>
                              <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0.1rem 0 0 0" }}>Attached PDF document with complete assignment details</p>
                            </div>
                          </div>
                          {assignment?.pdf_file && (
                            <a
                              href={getMediaUrl(assignment.pdf_file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                            >
                              <Download size={15} />
                              <span>View / Download PDF</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instructor / Admin View: All Student Submissions List & Grading Panel */}
              {isManager && (
                <div className="ui-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "0.85rem", borderBottom: "1px solid var(--border-color)", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <Users size={22} style={{ color: "var(--primary)" }} />
                      <div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                          Student Submissions ({allSubmissions.length})
                        </h3>
                        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0 }}>Review student responses, grade submissions, and provide evaluation feedback.</p>
                      </div>
                    </div>
                  </div>

                  {submissionsLoading ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading student submissions...</p>
                  ) : allSubmissions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
                      <Users size={32} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
                      <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>No Student Submissions Yet</p>
                      <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>When enrolled students submit work for this assignment, their submissions will appear here for grading.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {allSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            background: "var(--bg-subtle)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-md)",
                            padding: "1.25rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.85rem",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                                {sub.student_name ? sub.student_name.charAt(0).toUpperCase() : "S"}
                              </div>
                              <div>
                                <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                                  {sub.student_name || `Student #${sub.student}`}
                                </strong>
                                {sub.student_email && (
                                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>
                                    {sub.student_email}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "Draft"}
                              </span>
                              <span className={`badge-ui ${sub.status === "graded" ? "badge-success" : sub.status === "submitted" ? "badge-info" : "badge-warning"}`}>
                                {statusLabel(sub.status)}
                              </span>
                            </div>
                          </div>

                          {/* Student Content Preview */}
                          <div style={{ background: "var(--bg-surface)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", whiteSpace: "pre-line", fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                            {sub.content || <em style={{ color: "var(--text-muted)" }}>No submission content text attached.</em>}
                          </div>

                          {/* Student Uploaded Deliverable File */}
                          {sub.file && (
                            <div style={{ marginTop: "0.35rem" }}>
                              <a
                                href={getMediaUrl(sub.file)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                              >
                                <Download size={14} />
                                <span>View / Download Student Solution File</span>
                              </a>
                            </div>
                          )}

                          {/* Grading Form Controls */}
                          {gradingSubId === sub.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveGrade(sub.id);
                              }}
                              style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.5rem", padding: "1rem", background: "var(--primary-light)", borderRadius: "var(--radius-sm)", border: "1px solid var(--primary-border)" }}
                            >
                              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.85rem" }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                                    Score (Out of {activeAssignment.max_score ?? 100})
                                  </label>
                                  <input
                                    type="number"
                                    className="form-input"
                                    min="0"
                                    max={activeAssignment.max_score ?? 100}
                                    value={gradeScore}
                                    onChange={(e) => setGradeScore(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                                    Instructor Evaluation Feedback
                                  </label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Provide constructive feedback..."
                                    value={gradeFeedback}
                                    onChange={(e) => setGradeFeedback(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => setGradingSubId(null)} className="btn btn-secondary btn-sm">
                                  Cancel
                                </button>
                                <button type="submit" disabled={gradeSaving} className="btn btn-primary btn-sm">
                                  <Check size={14} />
                                  <span>{gradeSaving ? "Saving Grade..." : "Save Grade & Feedback"}</span>
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px dashed var(--border-color)" }}>
                              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                {sub.status === "graded" ? (
                                  <span>
                                    <strong>Score:</strong> {sub.score}/{activeAssignment.max_score ?? 100} • <strong>Feedback:</strong> {sub.feedback || "None"}
                                  </span>
                                ) : (
                                  <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Not evaluated yet</span>
                                )}
                              </div>
                              {!isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGradingSubId(sub.id);
                                    setGradeScore(sub.score || activeAssignment.max_score || 100);
                                    setGradeFeedback(sub.feedback || "");
                                  }}
                                  className="btn btn-outline btn-sm"
                                >
                                  <Edit3 size={14} />
                                  <span>{sub.status === "graded" ? "Edit Grade" : "Evaluate & Grade"}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submission Form & Student Work Card (Students Only) */}
              {!isManager && (
                <div className="ui-card">
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Send size={20} style={{ color: "var(--success)" }} />
                    <span>Your Submission & Deliverables</span>
                  </h3>

                  {submissionMessage && (
                    <div style={{ padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
                      {submissionMessage}
                    </div>
                  )}

                  {/* Score & Graded Feedback Box */}
                  {submission?.score !== undefined && submission?.score !== null && (
                    <div style={{ background: "var(--success-light)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--success)", fontWeight: 700, fontSize: "1rem" }}>
                        <CheckCircle2 size={20} />
                        <span>Graded: {submission.score} / {activeAssignment.max_score ?? 100} Points</span>
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-main)", marginTop: "0.35rem" }}>
                        <strong>Instructor Feedback:</strong>
                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)" }}>
                          {submission.feedback || "Good job! No additional feedback comments provided."}
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      persistSubmission("submitted");
                    }}
                    noValidate
                    style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                  >
                    <div className="form-field" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Submission Content & Project Notes
                      </label>
                      <textarea
                        name="content"
                        className="form-textarea"
                        onChange={(event) => setContent(event.target.value)}
                        rows={6}
                        placeholder="Write your answer, submit GitHub repository links, documentation, or solution summary here..."
                        value={content}
                      />
                    </div>

                    <div className="form-field" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Upload Project File / Deliverable (PDF, ZIP, Code, Docs)
                      </label>
                      <input
                        type="file"
                        className="form-input"
                        onChange={(event) => setSubmissionFile(event.target.files[0] || null)}
                      />
                      {submission?.file && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <FileCheck size={16} style={{ color: "var(--success)" }} />
                          <span>Submitted File: </span>
                          <a
                            href={getMediaUrl(submission.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}
                          >
                            View / Download Submitted File
                          </a>
                        </div>
                      )}
                      {validationError && (
                        <span className="form-error" style={{ marginTop: "0.5rem", display: "block" }}>
                          {validationError}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.85rem", pt: "0.5rem", borderTop: "1px solid var(--border-color)" }}>
                      <button
                        className="btn btn-secondary"
                        disabled={submitting}
                        onClick={() => persistSubmission("draft")}
                        type="button"
                      >
                        <Save size={16} />
                        <span>{submitting ? "Saving..." : "Save Draft"}</span>
                      </button>
                      <button className="btn btn-success btn-lg" style={{ maxWidth: "220px" }} disabled={submitting} type="submit">
                        <Send size={16} />
                        <span>{submitting ? "Submitting..." : "Submit Assignment"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="ui-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <CheckSquare size={48} style={{ color: "var(--text-light)", marginBottom: "0.85rem" }} />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>Select an Assignment</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                Choose an assignment from the left list to review project instructions and submit your work.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

