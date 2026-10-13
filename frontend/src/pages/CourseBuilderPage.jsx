import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Video,
  FileText,
  File,
  DollarSign,
  CheckCircle2,
  Eye,
  BookOpen,
  Sparkles,
  Award,
  HelpCircle,
  CheckSquare,
  FileQuestion,
  X,
  ArrowRight,
  GraduationCap,
  Printer,
  ExternalLink,
  Copy,
  Check,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { CoursePublishPanel } from "../features/courses/CoursePublishPanel.jsx";
import {
  createLesson,
  createSection,
  deleteCourse,
  deleteLesson,
  deleteSection,
  getCourse,
  updateLesson,
  updateSection,
  updateCoursePricing,
} from "../features/courses/courseService.js";
import { listQuizzes, createQuiz, createQuizQuestion } from "../features/quiz/quizService.js";
import { listAssignments, createAssignment } from "../features/assignments/assignmentService.js";
import { listCourseCertificates, issueCertificate } from "../features/certificate/certificateService.js";
import { listCourseEnrollments } from "../features/enrollment/enrollmentService.js";
import { CertificateModal } from "../components/CertificateModal.jsx";
import { Skeleton } from "../components/Skeleton.jsx";

const defaultOptions = [
  { text: "", is_correct: true },
  { text: "", is_correct: false },
  { text: "", is_correct: false },
  { text: "", is_correct: false },
];

const emptySection = { title: "", description: "", order: "" };
const emptyLesson = {
  title: "",
  kind: "video",
  video_url: "",
  video_file: null,
  notes: "",
  preview: false,
  order: "",
  pdf: null,
};

function formatPrice(price) {
  return Number(price || 0) > 0 ? `₹${Number(price).toFixed(2)}` : "Free";
}

function fieldError(errors, name) {
  const value = errors?.[name];
  return Array.isArray(value) ? value.join(" ") : value;
}

function SectionForm({ errors, initialValues = emptySection, onSubmit, submitLabel, onCancel }) {
  const [values, setValues] = useState({ ...emptySection, ...initialValues });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues({ ...emptySection, ...initialValues });
  }, [initialValues]);

  function updateField(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!values.title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        order: values.order === "" ? undefined : Number(values.order),
      });
      if (!initialValues.id) setValues(emptySection);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="ui-card" style={{ background: "var(--bg-subtle)", border: "1px dashed var(--border-color)", marginBottom: "1.5rem" }} onSubmit={handleSubmit}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-main)" }}>
        {initialValues.id ? "Edit Section" : "Create New Curriculum Section"}
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "1rem", marginBottom: "1rem" }}>
        <div className="form-field" style={{ margin: 0 }}>
          <label className="form-label">Section Title *</label>
          <input
            className="form-input"
            name="title"
            onChange={updateField}
            placeholder="e.g. Introduction & Setup"
            type="text"
            value={values.title}
          />
        </div>
        <div className="form-field" style={{ margin: 0 }}>
          <label className="form-label">Order</label>
          <input
            className="form-input"
            min="0"
            name="order"
            onChange={updateField}
            placeholder="1"
            type="number"
            value={values.order ?? ""}
          />
        </div>
      </div>

      <div className="form-field" style={{ marginBottom: "1rem" }}>
        <label className="form-label">Description (Optional)</label>
        <textarea
          className="form-textarea"
          name="description"
          onChange={updateField}
          placeholder="Brief description of what this section covers..."
          rows={2}
          value={values.description}
        />
      </div>

      {fieldError(errors, "title") && (
        <span className="form-error" style={{ marginBottom: "0.75rem", display: "block" }}>
          {fieldError(errors, "title")}
        </span>
      )}

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
            Cancel
          </button>
        )}
        <button disabled={submitting || !values.title.trim()} type="submit" className="btn btn-primary btn-sm">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function LessonForm({ errors, initialValues = emptyLesson, onSubmit, submitLabel, onCancel }) {
  const [values, setValues] = useState({ ...emptyLesson, ...initialValues, pdf: null, video_file: null });
  const [videoSourceMode, setVideoSourceMode] = useState(() => (initialValues?.video_url && !initialValues?.video_file ? "url" : "file"));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues({ ...emptyLesson, ...initialValues, pdf: null, video_file: null });
    setVideoSourceMode(initialValues?.video_url && !initialValues?.video_file ? "url" : "file");
  }, [initialValues]);

  function updateField(event) {
    const { checked, files, name, type, value } = event.target;
    setValues({
      ...values,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!values.title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        kind: values.kind,
        video_url: (values.video_url || "").trim(),
        video_file: values.video_file,
        notes: (values.notes || "").trim(),
        preview: values.preview,
        order: values.order === "" ? undefined : Number(values.order),
        pdf: values.pdf,
      });
      if (!initialValues.id) setValues(emptyLesson);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="ui-card" style={{ background: "var(--bg-surface)", border: "1px solid var(--primary-border)", marginTop: "1rem", marginBottom: "1rem" }} onSubmit={handleSubmit}>
      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.85rem", color: "var(--primary)" }}>
        {initialValues.id ? "Edit Lesson" : "+ Add Lesson to Section"}
      </h4>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px", gap: "0.85rem", marginBottom: "0.85rem" }}>
        <div className="form-field" style={{ margin: 0 }}>
          <label className="form-label">Lesson Title *</label>
          <input
            className="form-input"
            name="title"
            onChange={updateField}
            placeholder="e.g. Installing Node.js & Dependencies"
            type="text"
            value={values.title}
          />
        </div>

        <div className="form-field" style={{ margin: 0 }}>
          <label className="form-label">Type</label>
          <select className="form-select" name="kind" onChange={updateField} value={values.kind}>
            <option value="video">Video</option>
            <option value="pdf">PDF Document</option>
            <option value="notes">Text Notes</option>
          </select>
        </div>

        <div className="form-field" style={{ margin: 0 }}>
          <label className="form-label">Order</label>
          <input
            className="form-input"
            min="0"
            name="order"
            onChange={updateField}
            placeholder="1"
            type="number"
            value={values.order ?? ""}
          />
        </div>
      </div>

      {values.kind === "video" && (
        <div className="form-field" style={{ marginBottom: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <label className="form-label" style={{ margin: 0 }}>Lesson Video Content *</label>
            <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", color: "var(--text-main)", fontWeight: 600 }}>
                <input
                  type="radio"
                  name="video_source"
                  checked={videoSourceMode === "file"}
                  onChange={() => setVideoSourceMode("file")}
                />
                <span>Upload PC Video File</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", color: "var(--text-main)", fontWeight: 600 }}>
                <input
                  type="radio"
                  name="video_source"
                  checked={videoSourceMode === "url"}
                  onChange={() => setVideoSourceMode("url")}
                />
                <span>Video Stream URL</span>
              </label>
            </div>
          </div>

          {videoSourceMode === "file" ? (
            <div>
              <input
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                className="form-input"
                name="video_file"
                onChange={updateField}
                type="file"
              />
              {initialValues?.video_file && (
                <span style={{ fontSize: "0.78rem", color: "var(--success)", marginTop: "0.25rem", display: "block" }}>
                  ✓ Current video file attached
                </span>
              )}
            </div>
          ) : (
            <input
              className="form-input"
              name="video_url"
              onChange={updateField}
              placeholder="https://vimeo.com/... or https://youtube.com/..."
              type="url"
              value={values.video_url || ""}
            />
          )}
        </div>
      )}

      {values.kind === "pdf" && (
        <div className="form-field" style={{ marginBottom: "0.85rem" }}>
          <label className="form-label">Upload PDF Document</label>
          <input
            accept="application/pdf"
            className="form-input"
            name="pdf"
            onChange={updateField}
            type="file"
          />
        </div>
      )}

      <div className="form-field" style={{ marginBottom: "0.85rem" }}>
        <label className="form-label">Lesson Notes & Summary</label>
        <textarea
          className="form-textarea"
          name="notes"
          onChange={updateField}
          placeholder="Additional lesson text content, code snippets, or resources..."
          rows={2}
          value={values.notes || ""}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)", cursor: "pointer" }}>
          <input
            type="checkbox"
            name="preview"
            checked={Boolean(values.preview)}
            onChange={updateField}
          />
          <span>Allow Free Preview for Non-Enrolled Students</span>
        </label>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">
              Cancel
            </button>
          )}
          <button disabled={submitting || !values.title.trim()} type="submit" className="btn btn-primary btn-sm">
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>

      {fieldError(errors, "title") && (
        <span className="form-error" style={{ marginTop: "0.5rem", display: "block" }}>
          {fieldError(errors, "title")}
        </span>
      )}
    </form>
  );
}

function PricingForm({ course, errors, onSubmit }) {
  const [values, setValues] = useState({
    pricing: Number(course.price || 0) > 0 ? "paid" : "free",
    price: course.price || "0.00",
  });
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setValues({
      ...values,
      [name]: value,
      ...(name === "pricing" && value === "free" ? { price: "0.00" } : {}),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const price = Number(values.price);

    if (Number.isNaN(price) || price < 0) {
      setLocalError("Price must be zero or greater.");
      return;
    }

    if (values.pricing === "paid" && price <= 0) {
      setLocalError("Paid courses must have a price greater than 0.");
      return;
    }

    setLocalError("");
    setSubmitting(true);
    try {
      await onSubmit({
        pricing: values.pricing,
        price: values.pricing === "free" ? "0.00" : values.price,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="ui-card" style={{ marginBottom: "2rem" }} onSubmit={handleSubmit}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DollarSign size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>Course Pricing & Tier</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0" }}>
            Current price: <strong style={{ color: "var(--text-main)" }}>{formatPrice(course.price)}</strong>
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <select className="form-select" style={{ maxWidth: "160px" }} name="pricing" onChange={updateField} value={values.pricing}>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        <div style={{ position: "relative", maxWidth: "200px", flex: 1 }}>
          <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--text-muted)" }}>₹</span>
          <input
            className="form-input"
            style={{ paddingLeft: "2.2rem" }}
            disabled={values.pricing === "free"}
            min="0"
            name="price"
            onChange={updateField}
            step="0.01"
            type="number"
            value={values.price}
          />
        </div>

        <button disabled={submitting} type="submit" className="btn btn-secondary">
          {submitting ? "Saving..." : "Update Pricing"}
        </button>
      </div>

      {fieldError({ ...errors, price: localError || errors.price }, "price") && (
        <span className="form-error" style={{ marginTop: "0.75rem", display: "block" }}>
          {fieldError({ ...errors, price: localError || errors.price }, "price")}
        </span>
      )}
    </form>
  );
}

export function CourseBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access, role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const [course, setCourse] = useState(null);

  async function removeCourse() {
    if (!window.confirm(`Are you sure you want to delete "${course?.title || "this course"}"? This action cannot be undone.`)) return;
    try {
      await deleteCourse(id, access);
      navigate("/instructor/courses", { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to delete course.");
      setMessageType("error");
    }
  }
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [addLessonSectionId, setAddLessonSectionId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [status, setStatus] = useState("loading");

  // Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Quiz Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [activeQuizForQuestion, setActiveQuizForQuestion] = useState(null);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("single_choice");
  const [qOptions, setQOptions] = useState(defaultOptions);
  const [qSubmitting, setQSubmitting] = useState(false);
  const [qError, setQError] = useState("");

  // Assignment Modal State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState("");
  const [asgInstructions, setAsgInstructions] = useState("");
  const [asgAttachmentType, setAsgAttachmentType] = useState("text");
  const [asgPdfFile, setAsgPdfFile] = useState(null);
  const [asgVideoUrl, setAsgVideoUrl] = useState("");
  const [asgMaxScore, setAsgMaxScore] = useState(100);
  const [asgDueDate, setAsgDueDate] = useState("");
  const [asgSubmitting, setAsgSubmitting] = useState(false);
  const [asgError, setAsgError] = useState("");

  // Course Certification state
  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [certFilterTab, setCertFilterTab] = useState("students");
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certStudentId, setCertStudentId] = useState("");
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [certError, setCertError] = useState("");
  const [certSuccess, setCertSuccess] = useState("");
  const [selectedCertForPreview, setSelectedCertForPreview] = useState(null);
  const [copiedCertId, setCopiedCertId] = useState(null);
  const [certSearch, setCertSearch] = useState("");

  const loadCourse = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      const [courseData, quizzesData, assignmentsData, certsData, enrollmentsData] = await Promise.all([
        getCourse(id, access),
        listQuizzes(id, access).catch(() => []),
        listAssignments(id, access).catch(() => []),
        listCourseCertificates(id, access).catch(() => []),
        listCourseEnrollments(id, access).catch(() => []),
      ]);
      setCourse(courseData);
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : quizzesData?.results || []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.results || []);
      setCertificates(Array.isArray(certsData) ? certsData : certsData?.results || []);
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.results || []);
      setStatus("ready");
    } catch (error) {
      setMessage(error.message || "Unable to load course builder.");
      setMessageType("error");
      setStatus("error");
    }
  }, [access, id]);

  const reloadCertificatesData = useCallback(async () => {
    try {
      const [certsData, enrollmentsData] = await Promise.all([
        listCourseCertificates(id, access).catch(() => []),
        listCourseEnrollments(id, access).catch(() => []),
      ]);
      setCertificates(Array.isArray(certsData) ? certsData : certsData?.results || []);
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.results || []);
    } catch {
      // ignore
    }
  }, [access, id]);

  async function handleIssueCertificate(studentId, enrollmentId) {
    if (!studentId && !enrollmentId) return;
    setCertSubmitting(true);
    setCertError("");
    setCertSuccess("");
    try {
      const res = await issueCertificate(id, access, {
        student_id: studentId,
        enrollment_id: enrollmentId,
      });
      setCertSuccess("Official certificate successfully generated and awarded!");
      await reloadCertificatesData();
      setIsCertModalOpen(false);
      setCertStudentId("");
      const certObj = res?.certificate || res;
      if (certObj?.id || certObj?.certificate_id) {
        setSelectedCertForPreview(certObj);
      }
    } catch (err) {
      setCertError(err.message || "Failed to generate certificate.");
    } finally {
      setCertSubmitting(false);
    }
  }

  async function handleIssueAllCompleted() {
    const eligible = enrollments.filter((e) => e.completed && !e.has_certificate);
    if (eligible.length === 0) return;
    if (!window.confirm(`Award official certificates to all ${eligible.length} completed students now?`)) return;
    setCertSubmitting(true);
    setCertError("");
    setCertSuccess("");
    try {
      for (const item of eligible) {
        await issueCertificate(id, access, {
          enrollment_id: item.id,
          student_id: item.student_id || item.student,
        });
      }
      setCertSuccess(`Successfully awarded certificates to ${eligible.length} students!`);
      await reloadCertificatesData();
    } catch (err) {
      setCertError(err.message || "Failed to issue certificates for some students.");
    } finally {
      setCertSubmitting(false);
    }
  }

  function handleCopyVerifyUrl(cert) {
    const url = cert.verification_url || `${window.location.origin}/verify/${cert.certificate_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCertId(cert.certificate_id);
      setTimeout(() => setCopiedCertId(null), 2500);
    });
  }

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  async function handleCreateQuizSubmit(e) {
    e.preventDefault();
    if (!quizTitle.trim()) return;
    setQuizSubmitting(true);
    setQuizError("");
    try {
      const newQuiz = await createQuiz(id, { title: quizTitle.trim(), description: quizDescription.trim() }, access);
      setQuizzes((prev) => [...prev, newQuiz]);
      setQuizTitle("");
      setQuizDescription("");
      setIsQuizModalOpen(false);
    } catch (err) {
      setQuizError(err.message || "Failed to create quiz.");
    } finally {
      setQuizSubmitting(false);
    }
  }

  function handleQTypeChange(newType) {
    setQType(newType);
    if (newType === "true_false") {
      setQOptions([
        { text: "True", is_correct: true },
        { text: "False", is_correct: false },
      ]);
    } else if (qType === "true_false") {
      setQOptions(defaultOptions);
    }
  }

  function handleOptionChange(index, field, value) {
    setQOptions((prev) =>
      prev.map((opt, i) => {
        if (i === index) {
          return { ...opt, [field]: value };
        }
        if (field === "is_correct" && value && (qType === "single_choice" || qType === "true_false")) {
          return { ...opt, is_correct: false };
        }
        return opt;
      })
    );
  }

  function addOptionRow() {
    if (qOptions.length >= 6) return;
    setQOptions((prev) => [...prev, { text: "", is_correct: false }]);
  }

  function removeOptionRow(index) {
    if (qOptions.length <= 2) return;
    setQOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateQuestionSubmit(e) {
    e.preventDefault();
    if (!qText.trim() || !activeQuizForQuestion) return;

    const validOptions = qOptions
      .map((opt) => ({ text: opt.text.trim(), is_correct: Boolean(opt.is_correct) }))
      .filter((opt) => opt.text !== "");

    if (validOptions.length < 2) {
      setQError("Please provide at least 2 non-empty options.");
      return;
    }

    if (!validOptions.some((opt) => opt.is_correct)) {
      setQError("Please mark at least one option as correct.");
      return;
    }

    setQSubmitting(true);
    setQError("");
    try {
      const newQ = await createQuizQuestion(
        id,
        activeQuizForQuestion,
        {
          text: qText.trim(),
          question_type: qType,
          order: 1,
          options: validOptions,
        },
        access
      );

      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === activeQuizForQuestion
            ? { ...q, questions: [...(q.questions || []), newQ], question_count: (q.question_count || 0) + 1 }
            : q
        )
      );

      setQText("");
      setQType("single_choice");
      setQOptions(defaultOptions);
      setIsQuestionModalOpen(false);
      setActiveQuizForQuestion(null);
    } catch (err) {
      setQError(err.message || "Failed to add question to quiz.");
    } finally {
      setQSubmitting(false);
    }
  }

  async function handleCreateAssignmentSubmit(e) {
    e.preventDefault();
    if (!asgTitle.trim()) return;
    setAsgSubmitting(true);
    setAsgError("");
    try {
      const payload = {
        title: asgTitle.trim(),
        instructions: asgInstructions.trim(),
        attachment_type: asgAttachmentType,
        ...(asgAttachmentType === "pdf" && asgPdfFile ? { pdf_file: asgPdfFile } : {}),
        ...(asgAttachmentType === "video" ? { video_url: asgVideoUrl.trim() } : {}),
        max_score: Number(asgMaxScore) || 100,
        due_date: asgDueDate ? new Date(asgDueDate).toISOString() : undefined,
        status: "published",
      };
      const newAsg = await createAssignment(id, payload, access);
      setAssignments((prev) => [...prev, newAsg]);
      setAsgTitle("");
      setAsgInstructions("");
      setAsgAttachmentType("text");
      setAsgPdfFile(null);
      setAsgVideoUrl("");
      setAsgMaxScore(100);
      setAsgDueDate("");
      setIsAssignmentModalOpen(false);
    } catch (err) {
      setAsgError(err.message || "Failed to create assignment.");
    } finally {
      setAsgSubmitting(false);
    }
  }

  async function submitSection(values) {
    setErrors({});
    try {
      if (editingSection) {
        await updateSection(id, editingSection.id, values, access);
        setEditingSection(null);
      } else {
        await createSection(id, values, access);
        setShowAddSection(false);
      }
      await loadCourse();
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to save section.");
      setMessageType("error");
    }
  }

  async function submitPricing(values) {
    setErrors({});
    setMessage("");
    try {
      await updateCoursePricing(id, values, access);
      await loadCourse();
      setMessage("Pricing updated successfully.");
      setMessageType("success");
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to save pricing.");
      setMessageType("error");
    }
  }

  async function submitLesson(sectionId, values) {
    setErrors({});
    try {
      if (editingLesson) {
        await updateLesson(id, sectionId, editingLesson.id, values, access);
        setEditingLesson(null);
      } else {
        await createLesson(id, sectionId, values, access);
        setAddLessonSectionId(null);
      }
      await loadCourse();
    } catch (error) {
      setErrors(error.data || {});
      setMessage(error.message || "Unable to save lesson.");
      setMessageType("error");
    }
  }

  async function removeSection(sectionId) {
    if (!window.confirm("Delete this section and all its lessons?")) return;
    await deleteSection(id, sectionId, access).then(loadCourse).catch((error) => {
      setMessage(error.message || "Unable to delete section.");
      setMessageType("error");
    });
  }

  async function removeLesson(sectionId, lessonId) {
    if (!window.confirm("Delete this lesson?")) return;
    await deleteLesson(id, sectionId, lessonId, access).then(loadCourse).catch((error) => {
      setMessage(error.message || "Unable to delete lesson.");
      setMessageType("error");
    });
  }

  if (status === "loading") {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem 0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Skeleton height="32px" width="300px" />
        <Skeleton height="160px" borderRadius="var(--radius-lg)" />
        <Skeleton height="300px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 0" }}>
        <p className="form-error">{message}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem 0" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
        <div>
          <Link to="/instructor/courses" className="btn btn-secondary btn-sm" style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
            <ArrowLeft size={16} />
            <span>Back to Instructor Courses</span>
          </Link>
          <h1 className="h2" style={{ margin: 0 }}>Course Builder & Curriculum</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: "0.2rem 0 0 0" }}>{course.title}</p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="btn btn-primary" to={`/my-courses/${id}`}>
            <GraduationCap size={16} />
            <span>Learn Page</span>
          </Link>
          <Link className="btn btn-outline" to={`/courses/${id}`}>
            <BookOpen size={16} />
            <span>Public Page</span>
          </Link>
          <Link className="btn btn-secondary" to={`/courses/${id}/preview`}>
            <Eye size={16} />
            <span>Preview Content</span>
          </Link>
          <button type="button" onClick={removeCourse} className="btn btn-danger">
            <Trash2 size={16} />
            <span>Delete Course</span>
          </button>
        </div>
      </div>

      {/* Global Message Banner */}
      {message && (
        <div style={{ padding: "0.85rem 1.1rem", borderRadius: "var(--radius-md)", background: messageType === "success" ? "var(--success-light)" : "var(--danger-light)", color: messageType === "success" ? "var(--success)" : "var(--danger)", border: `1px solid ${messageType === "success" ? "var(--success-border)" : "var(--danger-border)"}`, marginBottom: "1.5rem", fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Course Publish Panel */}
      <CoursePublishPanel course={course} onPublished={setCourse} token={access} />

      {/* Pricing Control */}
      <PricingForm course={course} errors={errors} onSubmit={submitPricing} />

      {/* Curriculum Sections Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Layers size={22} style={{ color: "var(--primary)" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
            Curriculum Sections ({course.sections?.length || 0})
          </h2>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddSection(!showAddSection)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>{showAddSection ? "Close Form" : "Add Section"}</span>
          </button>
        )}
      </div>

      {/* Add Section Form */}
      {!isAdmin && showAddSection && (
        <SectionForm
          errors={errors}
          initialValues={emptySection}
          onSubmit={submitSection}
          submitLabel="Add Section"
          onCancel={() => setShowAddSection(false)}
        />
      )}

      {/* Sections List */}
      {course.sections?.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {course.sections.map((section, idx) => (
            <div key={section.id} className="ui-card" style={{ borderLeft: "4px solid var(--primary)" }}>
              {!isAdmin && editingSection?.id === section.id ? (
                <SectionForm
                  errors={errors}
                  initialValues={editingSection}
                  onSubmit={submitSection}
                  submitLabel="Update Section"
                  onCancel={() => setEditingSection(null)}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="badge-ui badge-info">Section {idx + 1}</span>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                        {section.title}
                      </h3>
                    </div>
                    {section.description && (
                      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                        {section.description}
                      </p>
                    )}
                  </div>

                  {!isAdmin && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setEditingSection(section)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Section"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Section"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Lessons in Section */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Lessons ({section.lessons?.length || 0})
                  </span>

                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => setAddLessonSectionId(addLessonSectionId === section.id ? null : section.id)}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus size={14} />
                      <span>Add Lesson</span>
                    </button>
                  )}
                </div>

                {/* Add Lesson Form */}
                {!isAdmin && addLessonSectionId === section.id && (
                  <LessonForm
                    errors={errors}
                    initialValues={emptyLesson}
                    onSubmit={(values) => submitLesson(section.id, values)}
                    submitLabel="Add Lesson"
                    onCancel={() => setAddLessonSectionId(null)}
                  />
                )}

                {section.lessons?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {section.lessons.map((lesson) => (
                      <div key={lesson.id}>
                        {!isAdmin && editingLesson?.id === lesson.id ? (
                          <LessonForm
                            errors={errors}
                            initialValues={editingLesson}
                            onSubmit={(values) => submitLesson(section.id, values)}
                            submitLabel="Update Lesson"
                            onCancel={() => setEditingLesson(null)}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "1rem",
                              padding: "0.75rem 1rem",
                              background: "var(--bg-subtle)",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid var(--border-color)"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              {lesson.kind === "video" ? <Video size={16} style={{ color: "var(--primary)" }} /> : lesson.kind === "pdf" ? <File size={16} style={{ color: "var(--danger)" }} /> : <FileText size={16} style={{ color: "var(--info)" }} />}
                              <div>
                                <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                                  {lesson.title}
                                </span>
                                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem" }}>
                                  <span style={{ textTransform: "capitalize" }}>{lesson.kind}</span>
                                  {lesson.preview && <span style={{ color: "var(--success)", fontWeight: 700 }}>• Free Preview</span>}
                                </div>
                              </div>
                            </div>

                            {!isAdmin && (
                              <div style={{ display: "flex", gap: "0.4rem" }}>
                                <button
                                  type="button"
                                  onClick={() => setEditingLesson(lesson)}
                                  className="btn btn-secondary btn-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeLesson(section.id, lesson.id)}
                                  className="btn btn-danger btn-sm"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "1.5rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    No lessons in this section yet. Click <strong>+ Add Lesson</strong> to add video or document lessons.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-box">
          <Layers size={40} style={{ color: "var(--text-light)" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>No Curriculum Sections Created</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Start building your course structure by adding your first section and lessons.
          </p>
          <button type="button" onClick={() => setShowAddSection(true)} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
            <Plus size={18} />
            <span>Add First Section</span>
          </button>
        </div>
      )}

      {/* Course Quizzes & Knowledge Checks Section */}
      <div className="ui-card" style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Award size={22} style={{ color: "var(--primary)" }} />
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                Course Quizzes ({quizzes.length})
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0" }}>
                Add knowledge check quizzes and questions to assess student understanding.
              </p>
            </div>
          </div>

          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsQuizModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>Add Quiz</span>
            </button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            <FileQuestion size={32} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
            <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>No Quizzes Created</p>
            <p style={{ margin: "0.2rem 0 0 0" }}>Quizzes added to this course will appear here for evaluation.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1.1rem",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{quiz.title}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: "0.75rem", marginTop: "0.15rem" }}>
                      <span>{quiz.question_count ?? quiz.questions?.length ?? 0} Questions</span>
                      {quiz.description && <span>{quiz.description}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuizForQuestion(quiz.id);
                        setIsQuestionModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={13} />
                      <span>Add Questions</span>
                    </button>
                  )}
                  <Link to={`/my-courses/${course.id}/quizzes/${quiz.id}`} className="btn btn-outline btn-sm">
                    <span>{isAdmin ? "Inspect Quiz" : "View / Manage Quiz"}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Assignments & Practical Projects Section */}
      <div className="ui-card" style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <CheckSquare size={22} style={{ color: "var(--success)" }} />
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                Course Assignments ({assignments.length})
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0" }}>
                Practical assignments and projects for student evaluation.
              </p>
            </div>
          </div>

          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsAssignmentModalOpen(true)}
              className="btn btn-success"
            >
              <Plus size={18} />
              <span>Add Assignment</span>
            </button>
          )}
        </div>

        {assignments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            <CheckSquare size={32} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
            <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>No Assignments Created</p>
            <p style={{ margin: "0.2rem 0 0 0" }}>Click <strong>+ Add Assignment</strong> to post practical projects for this course.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {assignments.map((asg) => (
              <div
                key={asg.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1.1rem",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckSquare size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{asg.title}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: "0.75rem", marginTop: "0.15rem" }}>
                      <span>Points: {asg.max_score || asg.total_points || 100}</span>
                      {asg.due_date && <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>

                <Link to={`/my-courses/${course.id}/assignments/${asg.id}`} className="btn btn-outline btn-sm">
                  <span>View Submissions & Grade</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Certification & Student Credentials Section */}
      <div id="certificates" className="ui-card" style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)" }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                  Course Certification & Student Credentials
                </h2>
                <span className="badge-ui badge-success" style={{ fontWeight: 700 }}>
                  {certificates.length} Issued
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                Issue official verifiable credentials, grant course certificates, and monitor completion progress.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {enrollments.filter((e) => e.completed && !e.has_certificate).length > 0 && !isAdmin && (
              <button
                type="button"
                onClick={handleIssueAllCompleted}
                disabled={certSubmitting}
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", borderColor: "var(--success)", color: "var(--success)" }}
                title="Issue certificates for all students who completed 100% of lessons"
              >
                <Sparkles size={16} />
                <span>Award All Completed ({enrollments.filter((e) => e.completed && !e.has_certificate).length})</span>
              </button>
            )}

            {!isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setCertError("");
                  setCertSuccess("");
                  setIsCertModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Plus size={18} />
                <span>Issue Certificate</span>
              </button>
            )}
          </div>
        </div>

        {/* Certificate Success / Error banners */}
        {certSuccess && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success-border)", marginBottom: "1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} />
              <span>{certSuccess}</span>
            </div>
            <button type="button" onClick={() => setCertSuccess("")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
              <X size={14} />
            </button>
          </div>
        )}

        {certError && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger-border)", marginBottom: "1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{certError}</span>
            <button type="button" onClick={() => setCertError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Quick Stat Highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ padding: "1rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Enrolled Students</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.25rem" }}>{enrollments.length}</div>
          </div>
          <div style={{ padding: "1rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Certificates Issued</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--success)", marginTop: "0.25rem" }}>{certificates.length}</div>
          </div>
          <div style={{ padding: "1rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>100% Completed</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.25rem" }}>
              {enrollments.filter((e) => e.completed).length}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Certification Rate</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.25rem" }}>
              {enrollments.length ? Math.round((certificates.length / enrollments.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Tab Controls & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setCertFilterTab("students")}
              className={`btn btn-sm ${certFilterTab === "students" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontWeight: 600 }}
            >
              <Users size={14} />
              <span>Enrolled Students ({enrollments.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setCertFilterTab("certificates")}
              className={`btn btn-sm ${certFilterTab === "certificates" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontWeight: 600 }}
            >
              <ShieldCheck size={14} />
              <span>Issued Credentials ({certificates.length})</span>
            </button>
          </div>

          <div style={{ maxWidth: "260px", width: "100%" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search student or code..."
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", margin: 0 }}
            />
          </div>
        </div>

        {/* Tab 1: Enrolled Students List */}
        {certFilterTab === "students" && (
          <div>
            {enrollments.filter((e) => {
              if (!certSearch.trim()) return true;
              const query = certSearch.toLowerCase();
              const name = (e.student_full_name || e.student_name || "").toLowerCase();
              const email = (e.student_email || "").toLowerCase();
              return name.includes(query) || email.includes(query);
            }).length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}>
                <Users size={32} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
                <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
                  {enrollments.length === 0 ? "No Students Enrolled Yet" : "No matching students found"}
                </p>
                <p style={{ fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                  {enrollments.length === 0 ? "Students who enroll in this course will appear here with progress tracking." : "Try adjusting your search query."}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {enrollments
                  .filter((e) => {
                    if (!certSearch.trim()) return true;
                    const query = certSearch.toLowerCase();
                    const name = (e.student_full_name || e.student_name || "").toLowerCase();
                    const email = (e.student_email || "").toLowerCase();
                    return name.includes(query) || email.includes(query);
                  })
                  .map((enr) => {
                    const matchingCert = certificates.find((c) => c.enrollment === enr.id || c.student === enr.student_id || c.student === enr.student);
                    const isCertified = Boolean(enr.has_certificate || matchingCert);

                    return (
                      <div
                        key={enr.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.85rem 1.1rem",
                          background: "var(--bg-subtle)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: "220px" }}>
                          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.95rem" }}>
                            {(enr.student_full_name || enr.student_name || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                              {enr.student_full_name || enr.student_name}
                            </strong>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              {enr.student_email || "No email provided"}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ flex: 1, minWidth: "160px", maxWidth: "240px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem", color: "var(--text-muted)" }}>
                            <span>Course Progress</span>
                            <strong style={{ color: "var(--text-main)" }}>{enr.progress_percentage || 0}%</strong>
                          </div>
                          <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min(Number(enr.progress_percentage || 0), 100)}%`,
                                background: enr.completed ? "var(--success)" : "var(--primary)",
                                borderRadius: "3px",
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>

                        {/* Status Badges & Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          {isCertified ? (
                            <>
                              <span className="badge-ui badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                                <CheckCircle2 size={12} />
                                <span>Certified</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const certToView = matchingCert || {
                                    id: enr.certificate_id || enr.id,
                                    certificate_id: enr.certificate_id || `CERT-${enr.id}`,
                                    student_name: enr.student_full_name || enr.student_name,
                                    course_title: course.title,
                                    instructor_name: course.instructor?.username || course.instructor_name || "Instructor",
                                    issued_at: enr.created_at,
                                  };
                                  setSelectedCertForPreview(certToView);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                              >
                                <Award size={13} />
                                <span>View Certificate</span>
                              </button>
                            </>
                          ) : (
                            <>
                              {enr.completed ? (
                                <span className="badge-ui badge-info">100% Completed</span>
                              ) : (
                                <span className="badge-ui badge-secondary">In Progress ({enr.progress_percentage || 0}%)</span>
                              )}

                              {!isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleIssueCertificate(enr.student_id || enr.student, enr.id)}
                                  disabled={certSubmitting || !enr.completed}
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    opacity: enr.completed ? 1 : 0.55,
                                    cursor: enr.completed ? "pointer" : "not-allowed",
                                  }}
                                  title={enr.completed ? "Award Certificate" : "Student must finish 100% of course lessons before certificate can be awarded"}
                                >
                                  <Sparkles size={13} />
                                  <span>{enr.completed ? "Award Certificate" : "Needs 100% Completion"}</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Issued Certificates List */}
        {certFilterTab === "certificates" && (
          <div>
            {certificates.filter((c) => {
              if (!certSearch.trim()) return true;
              const query = certSearch.toLowerCase();
              const name = (c.student_name || "").toLowerCase();
              const email = (c.student_email || "").toLowerCase();
              const code = (c.certificate_id || "").toLowerCase();
              return name.includes(query) || email.includes(query) || code.includes(query);
            }).length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}>
                <ShieldCheck size={32} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
                <p style={{ fontWeight: 600, color: "var(--text-main)", margin: 0 }}>No Certificates Issued Yet</p>
                <p style={{ fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                  Certificates awarded to students will appear here with instant verification links.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {certificates
                  .filter((c) => {
                    if (!certSearch.trim()) return true;
                    const query = certSearch.toLowerCase();
                    const name = (c.student_name || "").toLowerCase();
                    const email = (c.student_email || "").toLowerCase();
                    const code = (c.certificate_id || "").toLowerCase();
                    return name.includes(query) || email.includes(query) || code.includes(query);
                  })
                  .map((cert) => (
                    <div
                      key={cert.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.85rem 1.1rem",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Award size={18} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                              {cert.student_name || "Student"}
                            </strong>
                            <code style={{ fontSize: "0.78rem", background: "var(--bg-main)", padding: "0.15rem 0.4rem", borderRadius: "3px", border: "1px solid var(--border-color)" }}>
                              {cert.certificate_id}
                            </code>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: "0.75rem", marginTop: "0.2rem" }}>
                            <span>Issued: {new Date(cert.issued_at || cert.created_at || Date.now()).toLocaleDateString()}</span>
                            {cert.student_email && <span>• {cert.student_email}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => handleCopyVerifyUrl(cert)}
                          className="btn btn-outline btn-sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                        >
                          {copiedCertId === cert.certificate_id ? <Check size={13} style={{ color: "var(--success)" }} /> : <Copy size={13} />}
                          <span>{copiedCertId === cert.certificate_id ? "Copied!" : "Copy Link"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCertForPreview(cert)}
                          className="btn btn-primary btn-sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                        >
                          <Award size={13} />
                          <span>View / Print</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal 1: Add Quiz Modal */}
      {isQuizModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-md">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Award size={18} style={{ color: "var(--primary)" }} />
                <span>Add Quiz to Course</span>
              </h3>
              <button type="button" onClick={() => setIsQuizModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuizSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {quizError && <div style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{quizError}</div>}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quiz Title *</label>
                  <input
                    className="input"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Module 1 Knowledge Check"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Instructions / Description</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Optional quiz description..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsQuizModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={quizSubmitting || !quizTitle.trim()} className="btn btn-primary">
                  {quizSubmitting ? "Creating..." : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Question to Quiz Modal */}
      {isQuestionModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <HelpCircle size={18} style={{ color: "var(--primary)" }} />
                <span>Add Question to Quiz</span>
              </h3>
              <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {qError && <div style={{ color: "var(--danger)", fontSize: "0.85rem", fontWeight: 600 }}>{qError}</div>}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="e.g. Which hook is used for side effects in React?"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Question Type</label>
                  <select className="select" value={qType} onChange={(e) => handleQTypeChange(e.target.value)}>
                    <option value="single_choice">Single Choice (One correct answer)</option>
                    <option value="multiple_choice">Multiple Choice (Multiple correct answers)</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Answer Choices (Check correct answer)
                    </label>
                    {qOptions.length < 6 && (
                      <button type="button" onClick={addOptionRow} className="btn btn-secondary btn-sm" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                        + Add Choice
                      </button>
                    )}
                  </div>

                  {qOptions.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <input
                        type="checkbox"
                        checked={opt.is_correct}
                        onChange={(e) => handleOptionChange(idx, "is_correct", e.target.checked)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        className="input"
                        style={{ flex: 1 }}
                        placeholder={`Option ${idx + 1} text...`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                        required={idx < 2}
                      />
                      {qOptions.length > 2 && (
                        <button type="button" onClick={() => removeOptionRow(idx)} className="btn btn-outline btn-sm" style={{ padding: "0.4rem", color: "var(--danger)" }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={qSubmitting} className="btn btn-primary">
                  {qSubmitting ? "Adding..." : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-md">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckSquare size={18} style={{ color: "var(--success)" }} />
                <span>Add Assignment to Course</span>
              </h3>
              <button type="button" onClick={() => setIsAssignmentModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {asgError && <div style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{asgError}</div>}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assignment Title *</label>
                  <input
                    className="input"
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    placeholder="e.g. Build a Portfolio Application"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Question / Material Format *</label>
                  <select
                    className="select"
                    value={asgAttachmentType}
                    onChange={(e) => setAsgAttachmentType(e.target.value)}
                  >
                    <option value="text">Text Instructions</option>
                    <option value="pdf">PDF Document File</option>
                    <option value="video">Video Instruction URL</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Instructions / Task Brief *</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={asgInstructions}
                    onChange={(e) => setAsgInstructions(e.target.value)}
                    placeholder="Provide details on project requirements, submission format, and criteria..."
                    required
                  />
                </div>
                {asgAttachmentType === "pdf" && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Upload Question PDF File *</label>
                    <input
                      type="file"
                      className="input"
                      accept="application/pdf"
                      onChange={(e) => setAsgPdfFile(e.target.files[0] || null)}
                      required
                    />
                  </div>
                )}
                {asgAttachmentType === "video" && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Question Video URL (YouTube / Vimeo / MP4) *</label>
                    <input
                      type="url"
                      className="input"
                      value={asgVideoUrl}
                      onChange={(e) => setAsgVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or direct video link"
                      required
                    />
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Maximum Points / Score</label>
                    <input
                      type="number"
                      className="input"
                      value={asgMaxScore}
                      onChange={(e) => setAsgMaxScore(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Due Date (Optional)</label>
                    <input
                      type="date"
                      className="input"
                      value={asgDueDate}
                      onChange={(e) => setAsgDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAssignmentModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={asgSubmitting || !asgTitle.trim()} className="btn btn-success">
                  {asgSubmitting ? "Creating..." : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Issue / Award Certificate Modal */}
      {isCertModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-md">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Award size={18} style={{ color: "var(--primary)" }} />
                <span>Issue Course Certificate</span>
              </h3>
              <button type="button" onClick={() => setIsCertModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const enr = enrollments.find((item) => String(item.student_id || item.student) === String(certStudentId));
                handleIssueCertificate(certStudentId, enr?.id);
              }}
            >
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {certError && <div className="form-error">{certError}</div>}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Enrolled Student *</label>
                  <select
                    className="form-input"
                    value={certStudentId}
                    onChange={(e) => setCertStudentId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose completed student --</option>
                    {enrollments.map((enr) => (
                      <option
                        key={enr.id}
                        value={enr.student_id || enr.student}
                        disabled={!enr.completed || enr.has_certificate}
                      >
                        {enr.student_full_name || enr.student_name} ({enr.progress_percentage || 0}% progress)
                        {enr.has_certificate
                          ? " - Already Certified"
                          : enr.completed
                          ? " - Eligible (100% Completed)"
                          : " - Ineligible (Must complete 100%)"}
                      </option>
                    ))}
                  </select>
                  {enrollments.length === 0 && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem", display: "block" }}>
                      No students are currently enrolled in this course.
                    </span>
                  )}
                </div>

                <div style={{ padding: "0.85rem", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <ShieldCheck size={22} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: "block", color: "var(--text-main)", fontSize: "0.85rem" }}>
                      Completion Verification Requirement
                    </strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.4, display: "block", marginTop: "0.15rem" }}>
                      Certificates are strictly unlocked only after students learn and complete 100% of the lessons in the course curriculum.
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsCertModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certSubmitting || !certStudentId}
                  className="btn btn-primary"
                >
                  {certSubmitting ? "Generating..." : "Generate & Award Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Unified Official Certificate View & Print Modal */}
      {selectedCertForPreview && (
        <CertificateModal
          certificate={selectedCertForPreview}
          onClose={() => setSelectedCertForPreview(null)}
        />
      )}
    </div>
  );
}
