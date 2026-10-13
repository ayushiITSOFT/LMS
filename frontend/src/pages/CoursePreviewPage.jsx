import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Video,
  FileText,
  File,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Eye,
  Wrench,
  Pencil,
  Sparkles,
  BookOpen,
  User,
  Globe,
  Award,
  CheckCircle2,
  Lock,
  Search,
  HelpCircle,
  ExternalLink,
  PlayCircle,
  Layers,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { getCoursePreview, getCourse, listSections } from "../features/courses/courseService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";

function formatPrice(price) {
  return Number(price || 0) > 0 ? `$${Number(price).toFixed(2)}` : "Free";
}

function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

function getEmbedUrl(url) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?api=1`;
  }
  return null;
}

export function CoursePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access } = useAuth();

  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [curriculumSearch, setCurriculumSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  useEffect(() => {
    let active = true;
    setStatus("loading");

    const loadPreview = async () => {
      try {
        let previewData = await getCoursePreview(id, access).catch(() => null);
        let secData = previewData?.sections || [];
        const hasLessons = secData.some((s) => s.lessons && s.lessons.length > 0);

        if (!previewData || !hasLessons) {
          const courseRes = await getCourse(id, access).catch(() => null);
          const sectionsRes = await listSections(id, access).catch(() => []);
          const fullSecList = Array.isArray(sectionsRes) ? sectionsRes : sectionsRes?.results || [];

          if (courseRes) {
            previewData = {
              ...courseRes,
              sections: fullSecList.length > 0 ? fullSecList : courseRes.sections || [],
            };
          }
        }

        if (!active) return;
        if (!previewData) {
          throw new Error("Unable to load course preview data.");
        }

        setCourse(previewData);
        const allSecs = previewData.sections || [];
        const allLessons = allSecs.flatMap((s) => s.lessons || []);

        if (allLessons.length > 0) {
          setActiveLessonId(allLessons[0].id);
        }

        const initialExpanded = {};
        allSecs.forEach((_, idx) => {
          if (idx < 3) initialExpanded[idx] = true;
        });
        setExpandedSections(initialExpanded);
        setStatus("ready");
      } catch (err) {
        if (!active) return;
        setMessage(err.message || "Failed to load course preview.");
        setStatus("error");
      }
    };

    loadPreview();
    return () => {
      active = false;
    };
  }, [access, id]);

  const allLessons = useMemo(() => {
    if (!course?.sections) return [];
    return course.sections.flatMap((section) => section.lessons || []);
  }, [course]);

  const activeLesson = useMemo(() => {
    if (!allLessons.length || !activeLessonId) return null;
    return allLessons.find((l) => Number(l.id) === Number(activeLessonId)) || allLessons[0];
  }, [allLessons, activeLessonId]);

  const activeLessonIndex = useMemo(() => {
    if (!activeLesson || !allLessons.length) return -1;
    return allLessons.findIndex((l) => Number(l.id) === Number(activeLesson.id));
  }, [activeLesson, allLessons]);

  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null;

  function toggleAccordion(idx) {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  function handleVideoEnded() {
    if (nextLesson) {
      setActiveLessonId(nextLesson.id);
      (course?.sections || []).forEach((sec, idx) => {
        if (sec.lessons?.some((l) => Number(l.id) === Number(nextLesson.id))) {
          setExpandedSections((prev) => ({ ...prev, [idx]: true }));
        }
      });
    }
  }

  useEffect(() => {
    function handleMessage(event) {
      if (!event.data) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.event === "onStateChange" && data.info === 0) {
          handleVideoEnded();
        }
        if (data && (data.event === "finish" || data.event === "ended")) {
          handleVideoEnded();
        }
      } catch {}
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [nextLesson, course]);

  const filteredSections = useMemo(() => {
    if (!course?.sections) return [];
    if (!curriculumSearch.trim()) return course.sections;

    const term = curriculumSearch.toLowerCase();
    return course.sections.map((section) => {
      const matchSection = section.title?.toLowerCase().includes(term);
      const matchingLessons = (section.lessons || []).filter(
        (l) => l.title?.toLowerCase().includes(term) || l.notes?.toLowerCase().includes(term)
      );

      if (matchSection || matchingLessons.length > 0) {
        return {
          ...section,
          lessons: matchSection ? section.lessons : matchingLessons,
        };
      }
      return null;
    }).filter(Boolean);
  }, [course, curriculumSearch]);

  if (status === "loading") {
    return (
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <Skeleton height="60px" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
          <Skeleton height="450px" />
          <Skeleton height="450px" />
        </div>
      </div>
    );
  }

  if (status === "error" || !course) {
    return <ErrorState message={message || "Course preview not available."} onRetry={() => navigate(`/instructor/courses`)} />;
  }

  const rawInstructor = course.instructor?.username || course.instructor_name || course.instructor;
  const instructorName = typeof rawInstructor === "string" ? rawInstructor : (rawInstructor ? `Instructor #${rawInstructor}` : "Expert Instructor");
  const priceFormatted = formatPrice(course.price);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Studio Top Control & Header Bar */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--slate-900) 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "1.25rem 1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                background: "rgba(14, 165, 233, 0.2)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                fontSize: "0.725rem",
                fontWeight: 700,
                padding: "0.15rem 0.55rem",
                borderRadius: "var(--radius-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Eye size={13} />
              <span>Studio Live Preview Mode</span>
            </span>
            <StatusBadge status={course.status} />
            <span className="badge badge-info">{course.category || "General"}</span>
            <span className="badge badge-warning">{course.level || "All Levels"}</span>
          </div>

          <h1 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#ffffff", margin: 0, lineHeight: 1.25 }}>
            {course.title}
          </h1>
        </div>

        {/* Studio Actions & Quick Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link to={`/instructor/courses/${id}/builder`} className="btn btn-primary btn-sm">
            <Wrench size={15} />
            <span>Course Builder</span>
          </Link>
          <Link to={`/instructor/courses/${id}/edit`} className="btn btn-secondary btn-sm">
            <Pencil size={15} />
            <span>Edit Details</span>
          </Link>
          <Link to={`/courses/${id}`} className="btn btn-outline btn-sm" style={{ color: "#e2e8f0", borderColor: "rgba(255, 255, 255, 0.2)" }}>
            <Eye size={15} />
            <span>Public Page</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Theater Workspace */}
      {allLessons.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3.5rem 2rem",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border-color)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <BookOpen size={32} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--slate-900)", marginBottom: "0.5rem" }}>
            No Curriculum Lessons Added Yet
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto 1.5rem auto", fontSize: "0.95rem" }}>
            Your course structure is empty. Launch the Course Builder to create modules and upload video or text lessons.
          </p>
          <Link to={`/instructor/courses/${id}/builder`} className="btn btn-primary btn-lg">
            <Wrench size={18} />
            <span>Open Course Builder</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
          {/* Left: Theater Player Stage */}
          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Player Navigation Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
                    {activeLesson?.kind || "Lesson"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Lesson {activeLessonIndex + 1} of {allLessons.length}
                  </span>
                </div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--slate-900)", margin: 0 }}>
                  {activeLesson?.title || "Select a Lesson"}
                </h2>
              </div>

              {/* Lesson Nav Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                  disabled={!prevLesson}
                  className="btn btn-secondary btn-sm"
                >
                  <ArrowLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                  disabled={!nextLesson}
                  className="btn btn-primary btn-sm"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Media Player Area */}
            {activeLesson ? (
              <div
                style={{
                  background: "#000000",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  minHeight: "380px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {activeLesson.video_file ? (
                  <video
                    controls
                    controlsList="nodownload"
                    style={{ width: "100%", height: "100%", maxHeight: "480px" }}
                    src={getMediaUrl(activeLesson.video_file)}
                    onEnded={handleVideoEnded}
                  />
                ) : getEmbedUrl(activeLesson.video_url) ? (
                  <iframe
                    src={getEmbedUrl(activeLesson.video_url)}
                    title={activeLesson.title}
                    style={{ width: "100%", height: "420px", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={(e) => {
                      try {
                        e.target.contentWindow?.postMessage(
                          JSON.stringify({ event: "listening", id: "yt-player" }),
                          "*"
                        );
                      } catch {}
                    }}
                  />
                ) : activeLesson.video_url ? (
                  <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#ffffff" }}>
                    <PlayCircle size={48} style={{ color: "var(--primary)", marginBottom: "1rem" }} />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>External Video Lesson</h3>
                    <a
                      href={activeLesson.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-md"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <ExternalLink size={16} />
                      <span>Watch Video ({activeLesson.video_url})</span>
                    </a>
                  </div>
                ) : activeLesson.pdf ? (
                  <div style={{ width: "100%", height: "450px", background: "#f8fafc" }}>
                    <iframe src={getMediaUrl(activeLesson.pdf)} title="PDF Lesson Material" style={{ width: "100%", height: "100%", border: 0 }} />
                  </div>
                ) : (
                  <div style={{ padding: "4rem 2rem", textAlign: "center", background: "var(--slate-900)", width: "100%", height: "100%" }}>
                    <FileText size={48} style={{ color: "#94a3b8", marginBottom: "1rem" }} />
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                      Text & Interactive Reading Lesson
                    </h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Read the complete notes and instructions in the tab section below.</p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Content Tabs */}
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`btn btn-sm ${activeTab === "notes" ? "btn-primary" : "btn-secondary"}`}
                >
                  <FileText size={15} />
                  <span>Lesson Notes & Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("resources")}
                  className={`btn btn-sm ${activeTab === "resources" ? "btn-primary" : "btn-secondary"}`}
                >
                  <Download size={15} />
                  <span>Resources & Downloads</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
                >
                  <BookOpen size={15} />
                  <span>Course Overview</span>
                </button>
              </div>

              {/* Tab 1: Lesson Notes */}
              {activeTab === "notes" && (
                <div style={{ background: "var(--slate-50)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--slate-900)" }}>
                    Lesson Content & Material
                  </h3>
                  {activeLesson?.notes ? (
                    <div style={{ color: "var(--slate-700)", lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                      {activeLesson.notes}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic", margin: 0 }}>
                      No additional text notes attached to this lesson.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 2: Resources & Files */}
              {activeTab === "resources" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {activeLesson?.pdf ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem 1.25rem",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", background: "var(--danger-light)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <File size={20} />
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.95rem", color: "var(--slate-900)" }}>PDF Lesson Document</strong>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.1rem 0 0 0" }}>Attached PDF document file</p>
                        </div>
                      </div>
                      <a href={activeLesson.pdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        <Download size={14} />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  ) : (
                    <div style={{ padding: "1.5rem", textAlign: "center", background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
                      <File size={28} style={{ color: "var(--slate-400)", marginBottom: "0.35rem" }} />
                      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>No downloadable files attached to this lesson.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Course Overview */}
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ padding: "1.25rem", background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>About This Course</h3>
                    <p style={{ color: "var(--slate-700)", lineHeight: 1.6, fontSize: "0.9rem", margin: 0 }}>
                      {course.description || "No full description provided."}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                    <div style={{ padding: "0.85rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Instructor</span>
                      <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--slate-900)", marginTop: "0.2rem" }}>{instructorName}</strong>
                    </div>
                    <div style={{ padding: "0.85rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Course Price</span>
                      <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--slate-900)", marginTop: "0.2rem" }}>{priceFormatted}</strong>
                    </div>
                    <div style={{ padding: "0.85rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Total Curriculum</span>
                      <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--slate-900)", marginTop: "0.2rem" }}>
                        {course.sections?.length || 0} Modules ({allLessons.length} Lessons)
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Interactive Curriculum Sidebar Navigator */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-color)", background: "var(--slate-50)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--slate-900)", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Layers size={16} style={{ color: "var(--primary)" }} />
                  <span>Course Curriculum</span>
                </h3>
                <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                  {allLessons.length} Lessons
                </span>
              </div>

              {/* Search Filter Input */}
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Search lessons..."
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                  style={{ paddingLeft: "2rem", fontSize: "0.825rem" }}
                />
                <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
              </div>
            </div>

            {/* Modules & Lessons Accordion List */}
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {filteredSections.map((section, idx) => {
                const isExpanded = !!expandedSections[idx] || !!curriculumSearch.trim();
                const secLessons = section.lessons || [];

                return (
                  <div key={section.id || idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      style={{
                        width: "100%",
                        padding: "0.85rem 1.25rem",
                        background: "var(--bg-surface)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ transition: "transform 0.15s ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                          <ChevronDown size={15} style={{ color: "var(--slate-500)" }} />
                        </span>
                        <strong style={{ fontSize: "0.875rem", color: "var(--slate-900)" }}>
                          Module {idx + 1}: {section.title}
                        </strong>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {secLessons.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <div style={{ background: "var(--slate-50)", display: "flex", flexDirection: "column" }}>
                        {secLessons.map((lesson) => {
                          const isActive = Number(lesson.id) === Number(activeLessonId);
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => setActiveLessonId(lesson.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.75rem 1.25rem 0.75rem 2rem",
                                border: "none",
                                borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                                background: isActive ? "var(--primary-light)" : "transparent",
                                color: isActive ? "var(--primary)" : "var(--slate-700)",
                                fontWeight: isActive ? 600 : 400,
                                cursor: "pointer",
                                textAlign: "left",
                                fontSize: "0.85rem",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {lesson.video_file || lesson.video_url || lesson.kind === "video" ? (
                                  <Video size={14} style={{ color: isActive ? "var(--primary)" : "var(--slate-400)" }} />
                                ) : lesson.pdf ? (
                                  <File size={14} style={{ color: isActive ? "var(--primary)" : "var(--slate-400)" }} />
                                ) : (
                                  <FileText size={14} style={{ color: isActive ? "var(--primary)" : "var(--slate-400)" }} />
                                )}
                                <span>{lesson.title}</span>
                              </div>

                              <span style={{ fontSize: "0.7rem", opacity: 0.85 }}>
                                {lesson.preview ? "Preview" : lesson.kind || ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

