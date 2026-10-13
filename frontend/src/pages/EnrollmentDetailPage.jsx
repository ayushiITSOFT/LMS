import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Video,
  FileText,
  Award,
  BookOpen,
  FileCheck,
  Maximize2,
  Minimize2,
  Search,
  HelpCircle,
  CheckSquare,
  FileQuestion,
  Clock,
  Wrench,
  Zap,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import {
  completeLesson,
  getEnrollment,
  getResumeLesson,
} from "../features/enrollment/enrollmentService.js";
import { getCourse } from "../features/courses/courseService.js";
import { listQuizzes } from "../features/quiz/quizService.js";
import { listAssignments } from "../features/assignments/assignmentService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
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

export function EnrollmentDetailPage() {
  const { id } = useParams();
  const { access, role } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completionStatus, setCompletionStatus] = useState("ready");

  // Video auto-advance & completion tracking
  const [autoAdvance, setAutoAdvance] = useState(() => {
    try {
      const val = localStorage.getItem("lms_auto_advance");
      return val !== null ? JSON.parse(val) : true;
    } catch {
      return true;
    }
  });
  const [completedVideos, setCompletedVideos] = useState({});
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null);

  // Player controls state
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [curriculumSearch, setCurriculumSearch] = useState("");
  
  // Section Accordion expanded states
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    let active = true;
    const fetchEnrollmentData = getEnrollment(id, access).catch(() =>
      getCourse(id, access).then((res) => ({ course: res, sections: res.sections || [] }))
    );
    const fetchResumeData = getResumeLesson(id, access).catch(() => null);
    const fetchQuizzesData = listQuizzes(id, access).catch(() => []);
    const fetchAssignmentsData = listAssignments(id, access).catch(() => []);

    Promise.all([fetchEnrollmentData, fetchResumeData, fetchQuizzesData, fetchAssignmentsData])
      .then(([data, resume, quizzesRes, assignmentsRes]) => {
        if (!active) return;
        setEnrollment(data);
        const qList = Array.isArray(quizzesRes) ? quizzesRes : quizzesRes?.results || [];
        const aList = Array.isArray(assignmentsRes) ? assignmentsRes : assignmentsRes?.results || [];
        setQuizzes(qList);
        setAssignments(aList);

        const resumeId = resume?.lesson?.id;
        const allLessons = data.sections?.flatMap((s) => s.lessons || []) || [];
        const initial = allLessons.find((l) => l.id === resumeId) || allLessons[0] || null;
        setSelectedLesson(initial);

        // Auto expand sections containing lessons or active lesson
        const initialExpanded = {};
        data.sections?.forEach((sec, idx) => {
          if (sec.lessons?.some((l) => l.id === initial?.id) || idx === 0) {
            initialExpanded[idx] = true;
          }
        });
        setExpandedSections(initialExpanded);

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
  }, [access, id]);

  const course = enrollment?.course || enrollment || {};
  const rawSections = enrollment?.sections || course?.sections || [];
  const sections = Array.isArray(rawSections) ? rawSections : [];
  const allLessons = useMemo(() => {
    return sections.flatMap((s) => s.lessons || []);
  }, [sections]);

  const completedLessonsCount = allLessons.filter((l) => l.completed).length;
  const progressPercent = enrollment?.progress_percentage ?? (allLessons.length ? Math.round((completedLessonsCount / allLessons.length) * 100) : 0);
  const isCourseComplete = progressPercent >= 100 || !!enrollment?.course_completed;

  const currentIndex = allLessons.findIndex((l) => Number(l.id) === Number(selectedLesson?.id));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Sequential lesson locking: A lesson is unlocked if it's the first lesson, already completed, or the previous lesson is completed
  const unlockedLessonIds = useMemo(() => {
    const unlocked = new Set();
    if (!allLessons.length) return unlocked;

    // Instructors and admins have full preview access to any lesson
    if (role === "instructor" || role === "admin") {
      allLessons.forEach((l) => unlocked.add(Number(l.id)));
      return unlocked;
    }

    // First lesson in course is always accessible
    unlocked.add(Number(allLessons[0].id));

    // Subsequent lessons unlock once the preceding lesson is completed
    for (let i = 0; i < allLessons.length; i++) {
      const lesson = allLessons[i];
      const lessonId = Number(lesson.id);

      if (lesson.completed) {
        unlocked.add(lessonId);
        if (i + 1 < allLessons.length) {
          unlocked.add(Number(allLessons[i + 1].id));
        }
      }
    }
    return unlocked;
  }, [allLessons, role]);

  function toggleSection(idx) {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  // Collect all video sources for the current lesson (video file and/or external streaming link)
  const lessonVideos = useMemo(() => {
    if (!selectedLesson) return [];
    const list = [];
    if (selectedLesson.video_file) {
      list.push({
        id: "video_file",
        title: "Uploaded Video",
        type: "file",
        src: getMediaUrl(selectedLesson.video_file),
      });
    }
    if (selectedLesson.video_url) {
      const embed = getEmbedUrl(selectedLesson.video_url);
      list.push({
        id: "video_url",
        title: "Streaming Video",
        type: embed ? "embed" : "direct",
        src: embed || selectedLesson.video_url,
      });
    }
    return list;
  }, [selectedLesson]);

  // Reset video player and auto-advance countdown on lesson change
  useEffect(() => {
    setActiveVideoIndex(0);
    setAutoAdvanceCountdown(null);
  }, [selectedLesson?.id]);

  function proceedToNextLesson() {
    setAutoAdvanceCountdown(null);
    if (nextLesson) {
      setMessage("");
      setSelectedLesson(nextLesson);
      // Auto-expand section containing the next lesson
      sections.forEach((sec, idx) => {
        if (sec.lessons?.some((l) => Number(l.id) === Number(nextLesson.id))) {
          setExpandedSections((prev) => ({ ...prev, [idx]: true }));
        }
      });
      // Smooth scroll up to video player stage
      setTimeout(() => {
        const stageEl = document.querySelector(".lesson-stage");
        if (stageEl) {
          stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  }

  function cancelAutoAdvance() {
    setAutoAdvanceCountdown(null);
  }

  async function handleComplete() {
    if (!selectedLesson || selectedLesson.completed) return true;
    setCompletionStatus("loading");

    try {
      await completeLesson(id, selectedLesson.id, access);
      const updated = await getEnrollment(id, access);
      setEnrollment(updated);

      const updatedSections = updated.sections || updated.course?.sections || [];
      const updatedLessons = updatedSections.flatMap((s) => s.lessons || []);
      const updatedCurrent = updatedLessons.find((l) => Number(l.id) === Number(selectedLesson.id));
      setSelectedLesson(updatedCurrent || { ...selectedLesson, completed: true });
      setCompletionStatus("ready");
      return true;
    } catch (error) {
      // Don't block the student if backend call fails (e.g., non-student role previewing)
      setCompletionStatus("ready");
      return false;
    }
  }

  // Handle single video completion: check if all videos in lesson are complete, then advance
  async function handleVideoEnded(videoKey) {
    if (!selectedLesson) return;

    const lessonId = Number(selectedLesson.id);
    const currentCompleted = new Set(completedVideos[lessonId] || []);
    if (videoKey) {
      currentCompleted.add(videoKey);
    }

    setCompletedVideos((prev) => ({
      ...prev,
      [lessonId]: currentCompleted,
    }));

    // If lesson has multiple videos, verify if all are completed
    const totalVideos = lessonVideos.length;
    const allVideosFinished = totalVideos <= 1 || lessonVideos.every((v) => currentCompleted.has(v.id));

    if (!allVideosFinished) {
      // If there are more videos in this lesson, switch to the next one
      const nextIdx = activeVideoIndex + 1;
      if (nextIdx < totalVideos) {
        setActiveVideoIndex(nextIdx);
      }
      return;
    }

    // All videos in this lesson are complete!
    // 1. Optimistically unlock the next lesson immediately in local state
    setSelectedLesson((prev) => ({ ...prev, completed: true }));
    setEnrollment((prev) => {
      if (!prev) return prev;
      const updatedSections = (prev.sections || prev.course?.sections || []).map((sec) => ({
        ...sec,
        lessons: (sec.lessons || []).map((les) =>
          Number(les.id) === lessonId ? { ...les, completed: true } : les
        ),
      }));
      return {
        ...prev,
        sections: updatedSections,
      };
    });

    // 2. Persist completion to backend
    handleComplete();

    // 3. Immediately trigger auto-advance countdown if next lesson exists
    if (nextLesson) {
      if (autoAdvance) {
        setAutoAdvanceCountdown(3);
      }
    }
  }

  // Auto-advance countdown timer
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown <= 0) {
      proceedToNextLesson();
      return;
    }

    const timer = setTimeout(() => {
      setAutoAdvanceCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoAdvanceCountdown, nextLesson]);

  // Listen to YouTube and Vimeo iframe messages for ended events
  useEffect(() => {
    function handleMessage(event) {
      if (!event.data) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        // YouTube event: onStateChange with info === 0 (ended)
        if (data && data.event === "onStateChange" && data.info === 0) {
          handleVideoEnded("video_url");
        }
        // Vimeo finish/ended event
        if (data && (data.event === "finish" || data.event === "ended")) {
          handleVideoEnded("video_url");
        }
      } catch {}
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [selectedLesson, completedVideos, activeVideoIndex, lessonVideos, autoAdvance, nextLesson]);

  // Filter lessons in sidebar if user searches
  const filteredSections = sections.map((section) => {
    if (!curriculumSearch.trim()) return section;
    const filteredLessons = (section.lessons || []).filter((l) =>
      l.title.toLowerCase().includes(curriculumSearch.toLowerCase().trim())
    );
    return { ...section, lessons: filteredLessons };
  }).filter((sec) => !curriculumSearch.trim() || sec.lessons.length > 0);

  if (status === "loading") {
    return (
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <Skeleton height="80px" />
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
          <Skeleton height="500px" />
          <Skeleton height="500px" />
        </div>
      </div>
    );
  }

  if (status === "error" || !enrollment) {
    return <ErrorState message={message || "Unable to load course workspace."} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Top Learning Area Header & Focus Bar */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link
              to={role === "instructor" || role === "admin" ? "/instructor/courses" : "/my-courses"}
              className="btn btn-secondary btn-sm"
              style={{ padding: "0.35rem 0.65rem" }}
              title={role === "instructor" || role === "admin" ? "Back to Instructor Courses" : "Back to My Courses"}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </Link>

            <div>
              <div style={{ fontSize: "0.775rem", color: "var(--slate-500)", fontWeight: 500 }}>
                Learning Workspace
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: "800", letterSpacing: "-0.01em", margin: 0 }}>
                {course.title || "Course Learning Workspace"}
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {(role === "instructor" || role === "admin") && (
              <Link to={`/instructor/courses/${id}/builder`} className="btn btn-primary btn-sm">
                <Wrench size={15} />
                <span>Course Builder</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`btn btn-sm ${isFocusMode ? "btn-primary" : "btn-secondary"}`}
              title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode (Full Width)"}
            >
              {isFocusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span className="nav-link-text">{isFocusMode ? "Exit Focus" : "Focus Mode"}</span>
            </button>

            {quizzes.length > 0 && (
              <a href="#assessments" className="btn btn-outline btn-sm">
                <HelpCircle size={15} style={{ color: "var(--primary)" }} />
                <span>Quizzes ({quizzes.length})</span>
              </a>
            )}

            <Link to={`/my-courses/${id}/assignments`} className="btn btn-outline btn-sm">
              <CheckSquare size={15} style={{ color: "var(--success)" }} />
              <span>Assignments ({assignments.length})</span>
            </Link>

            {isCourseComplete && (
              <Link to="/certificates" className="btn btn-primary btn-sm">
                <Award size={15} />
                <span>Certificate</span>
              </Link>
            )}
          </div>
        </div>

        {/* Progress Bar & Counter Strip */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", background: "var(--slate-50)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600 }}>
            <span style={{ color: "var(--slate-700)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <BookOpen size={14} />
              <span>Overall Progress ({completedLessonsCount} of {allLessons.length} lessons completed)</span>
            </span>
            <span style={{ color: isCourseComplete ? "var(--success)" : "var(--slate-900)", fontWeight: 700 }}>
              {progressPercent}% {isCourseComplete ? "Complete 🎉" : ""}
            </span>
          </div>

          <div className="progress-bar-ui" style={{ height: "7px" }}>
            <div
              className={`progress-bar-fill ${isCourseComplete ? "success" : ""}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          {/* Certificate Completion Status Notification */}
          {isCourseComplete ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.1rem",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.1) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                borderRadius: "var(--radius-md)",
                gap: "1rem",
                flexWrap: "wrap",
                marginTop: "0.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#10b981",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--slate-900)" }}>
                    Course Completed (100%) • Official Certificate Earned!
                  </strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--slate-600)" }}>
                    You have completed all course lessons. Your official verifiable credential is ready to view and download.
                  </div>
                </div>
              </div>
              <Link to="/certificates" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Award size={15} />
                <span>View Official Certificate</span>
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
                color: "var(--slate-500)",
                padding: "0.2rem 0.25rem",
                marginTop: "0.2rem",
              }}
            >
              <Lock size={13} style={{ color: "var(--slate-400)" }} />
              <span>
                Official Course Certificate unlocks once 100% of the lessons are completed ({completedLessonsCount}/{allLessons.length} finished).
              </span>
            </div>
          )}
        </div>
      </div>

      {message && <div style={{ color: "var(--danger)", fontWeight: 600, fontSize: "0.875rem" }}>{message}</div>}

      {/* Main Learning Workspace */}
      {sections.length > 0 ? (
        <div className={`learning-layout ${isFocusMode ? "focused-mode" : ""}`}>
          {/* Left: Curriculum Sidebar */}
          {!isFocusMode && (
            <div className="curriculum-sidebar">
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border-color)", background: "var(--slate-100)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--slate-700)" }}>
                    Course Modules ({enrollment.sections.length})
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    {completedLessonsCount}/{allLessons.length}
                  </span>
                </div>

                {/* Search in Curriculum */}
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Search lessons..."
                    value={curriculumSearch}
                    onChange={(e) => setCurriculumSearch(e.target.value)}
                    style={{ paddingLeft: "2.1rem", fontSize: "0.8rem", padding: "0.35rem 0.65rem 0.35rem 2.1rem" }}
                  />
                  <Search size={13} style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
                </div>
              </div>

              {filteredSections.map((section, sIdx) => {
                const isExpanded = expandedSections[sIdx] !== false || !!curriculumSearch.trim();
                const secLessons = section.lessons || [];
                const secCompletedCount = secLessons.filter((l) => l.completed).length;

                return (
                  <div key={section.id || sIdx} className="curriculum-section">
                    <button
                      type="button"
                      onClick={() => toggleSection(sIdx)}
                      className="section-header-btn"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className={`accordion-chevron ${isExpanded ? "expanded" : ""}`}>
                          <ChevronDown size={15} />
                        </span>
                        <span style={{ fontSize: "0.825rem", fontWeight: 700 }}>
                          Module {sIdx + 1}: {section.title}
                        </span>
                      </div>

                      <span style={{ fontSize: "0.725rem", color: "var(--slate-500)", fontWeight: 600 }}>
                        {secCompletedCount}/{secLessons.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="lesson-list">
                        {secLessons.map((lesson) => {
                          const isLessonActive = Number(selectedLesson?.id) === Number(lesson.id);
                          const isDone = lesson.completed;
                          const isUnlocked = unlockedLessonIds.has(Number(lesson.id));

                          return (
                            <div
                              key={lesson.id}
                              className={`lesson-item ${isLessonActive ? "active" : isDone ? "completed" : ""} ${!isUnlocked ? "locked" : ""}`}
                              onClick={() => {
                                if (!isUnlocked) {
                                  setMessage(`Please complete the preceding lesson video before proceeding to "${lesson.title}".`);
                                  return;
                                }
                                setMessage("");
                                setSelectedLesson(lesson);
                              }}
                              style={{
                                cursor: isUnlocked ? "pointer" : "not-allowed",
                                opacity: isUnlocked ? 1 : 0.6,
                              }}
                              title={!isUnlocked ? "Complete preceding lesson to unlock" : lesson.title}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                                {!isUnlocked ? (
                                  <Lock size={15} style={{ color: "var(--slate-400)", flexShrink: 0 }} />
                                ) : isDone ? (
                                  <CheckCircle2 size={15} style={{ color: "var(--success)", flexShrink: 0 }} />
                                ) : isLessonActive ? (
                                  <PlayCircle size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                                ) : (
                                  <PlayCircle size={15} style={{ color: "var(--slate-400)", flexShrink: 0 }} />
                                )}
                                <span style={{ fontSize: "0.825rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {lesson.title}
                                </span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                                {!isUnlocked && (
                                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--slate-500)", background: "var(--slate-200)", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)" }}>
                                    Locked
                                  </span>
                                )}
                                <span style={{ fontSize: "0.7rem", color: "var(--slate-400)" }}>
                                  {lesson.kind || ""}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Right Stage: Premium Player & Content Stage */}
          <div key={selectedLesson?.id || "empty"} className="card lesson-stage">
            {selectedLesson ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Lesson Action Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span className="badge badge-info">{selectedLesson.kind || "Lesson"}</span>
                      {selectedLesson.completed && (
                        <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <CheckCircle2 size={12} />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--slate-900)" }}>
                      {selectedLesson.title}
                    </h2>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !autoAdvance;
                        setAutoAdvance(nextVal);
                        try {
                          localStorage.setItem("lms_auto_advance", JSON.stringify(nextVal));
                        } catch {}
                      }}
                      className={`btn btn-sm ${autoAdvance ? "btn-outline" : "btn-secondary"}`}
                      title={autoAdvance ? "Auto-advance ON: automatically proceeds to next lesson when video completes" : "Auto-advance OFF"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        borderColor: autoAdvance ? "var(--primary)" : undefined,
                        color: autoAdvance ? "var(--primary)" : undefined,
                        fontWeight: 600,
                      }}
                    >
                      <Zap size={14} style={{ fill: autoAdvance ? "currentColor" : "none" }} />
                      <span>Auto-advance: {autoAdvance ? "On" : "Off"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={selectedLesson.completed || completionStatus === "loading"}
                      className={`btn ${selectedLesson.completed ? "btn-secondary" : "btn-primary"}`}
                    >
                      {selectedLesson.completed ? (
                        <>
                          <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                          <span>Completed</span>
                        </>
                      ) : completionStatus === "loading" ? (
                        <span>Saving Progress...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Mark as Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Multi-video Playlist Tabs (if this lesson contains multiple videos) */}
                {lessonVideos.length > 1 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", background: "var(--slate-100)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--slate-700)" }}>Lesson Videos ({lessonVideos.length}):</span>
                    {lessonVideos.map((vid, idx) => {
                      const isWatched = (completedVideos[selectedLesson.id] || new Set()).has(vid.id);
                      const isActive = activeVideoIndex === idx;
                      return (
                        <button
                          key={vid.id}
                          type="button"
                          onClick={() => setActiveVideoIndex(idx)}
                          className={`btn btn-xs ${isActive ? "btn-primary" : "btn-secondary"}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            fontSize: "0.78rem",
                            padding: "0.25rem 0.6rem",
                          }}
                        >
                          {isWatched ? (
                            <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
                          ) : (
                            <PlayCircle size={13} />
                          )}
                          <span>Video {idx + 1}: {vid.title}</span>
                          {isWatched && <span style={{ opacity: 0.8, fontSize: "0.7rem" }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Theater Video Player */}
                {lessonVideos.length > 0 ? (
                  (() => {
                    const activeVideo = lessonVideos[activeVideoIndex] || lessonVideos[0];
                    if (activeVideo.type === "embed") {
                      return (
                        <div className="player-video-container">
                          <iframe
                            key={activeVideo.src}
                            src={activeVideo.src}
                            title={selectedLesson.title}
                            style={{ width: "100%", height: "100%", minHeight: "420px", border: 0 }}
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
                        </div>
                      );
                    }
                    return (
                      <div className="player-video-container">
                        <video
                          key={activeVideo.src}
                          controls
                          autoPlay={activeVideoIndex > 0}
                          controlsList="nodownload"
                          style={{ width: "100%", height: "100%", maxHeight: "500px" }}
                          src={activeVideo.src}
                          onEnded={() => handleVideoEnded(activeVideo.id)}
                        />
                      </div>
                    );
                  })()
                ) : selectedLesson.kind === "video" ? (
                  <div
                    className="player-video-container"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--slate-900)",
                      color: "#ffffff",
                      padding: "3.5rem 1.5rem",
                      textAlign: "center",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <Video size={48} style={{ color: "var(--primary)", marginBottom: "1rem" }} />
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "#ffffff" }}>
                      No Video Content Attached Yet
                    </h3>
                    <p style={{ color: "var(--slate-400)", fontSize: "0.9rem", maxWidth: "450px", margin: 0 }}>
                      This lesson is marked as a Video Lesson, but no video file or streaming link has been provided yet by the instructor. Check out the lesson notes below!
                    </p>
                  </div>
                ) : null}

                {/* Auto-Advance Next Lesson Countdown Banner */}
                {autoAdvanceCountdown !== null && nextLesson && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                      color: "#ffffff",
                      padding: "1rem 1.25rem",
                      borderRadius: "var(--radius-lg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                      boxShadow: "0 8px 24px rgba(79, 70, 229, 0.35)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.15rem",
                          fontWeight: 800,
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        {autoAdvanceCountdown}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                          Video complete! Next lesson starting in {autoAdvanceCountdown}s...
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#c7d2fe", marginTop: "0.15rem" }}>
                          Up next: <span style={{ fontWeight: 600, color: "#ffffff" }}>{nextLesson.title}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={proceedToNextLesson}
                        className="btn btn-primary btn-sm"
                        style={{ background: "#ffffff", color: "#4338ca", fontWeight: 700, border: "none" }}
                      >
                        <span>Play Next Now</span>
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelAutoAdvance}
                        className="btn btn-sm"
                        style={{ background: "rgba(255, 255, 255, 0.1)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                      >
                        Stay on Lesson
                      </button>
                    </div>
                  </div>
                )}

                {/* Player Content Tabs (Overview, Quizzes, Assignments, Resources) */}
                <div>
                  <div className="player-tabs-header">
                    <button
                      type="button"
                      className={`player-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                      onClick={() => setActiveTab("overview")}
                    >
                      <BookOpen size={15} />
                      <span>Overview & Notes</span>
                    </button>

                    <button
                      type="button"
                      className={`player-tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
                      onClick={() => setActiveTab("quizzes")}
                    >
                      <HelpCircle size={15} />
                      <span>Quizzes ({quizzes.length})</span>
                    </button>

                    <button
                      type="button"
                      className={`player-tab-btn ${activeTab === "assignments" ? "active" : ""}`}
                      onClick={() => setActiveTab("assignments")}
                    >
                      <CheckSquare size={15} />
                      <span>Assignments ({assignments.length})</span>
                    </button>

                    {selectedLesson.pdf && (
                      <button
                        type="button"
                        className={`player-tab-btn ${activeTab === "resources" ? "active" : ""}`}
                        onClick={() => setActiveTab("resources")}
                      >
                        <FileText size={15} />
                        <span>Resources</span>
                      </button>
                    )}
                  </div>

                  <div style={{ paddingTop: "1.25rem" }}>
                    {activeTab === "overview" && (
                      <div style={{ color: "var(--slate-700)", lineHeight: "1.65", fontSize: "0.925rem" }}>
                        {selectedLesson.notes ? (
                          <div style={{ whiteSpace: "pre-wrap" }}>{selectedLesson.notes}</div>
                        ) : (
                          <p style={{ color: "var(--text-muted)" }}>
                            No additional text notes provided for this lesson. Watch the video above to follow along.
                          </p>
                        )}
                      </div>
                    )}

                    {activeTab === "quizzes" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <HelpCircle size={18} style={{ color: "var(--primary)" }} />
                          <span>Course Quizzes & Knowledge Checks</span>
                        </h4>
                        {quizzes.length === 0 ? (
                          <div className="card" style={{ background: "var(--slate-50)", textAlign: "center", padding: "1.5rem" }}>
                            <FileQuestion size={28} style={{ color: "var(--slate-400)", marginBottom: "0.35rem" }} />
                            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>No quizzes published yet for this course.</p>
                          </div>
                        ) : (
                          quizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.85rem 1.1rem",
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-md)",
                                gap: "1rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <Award size={18} />
                                </div>
                                <div>
                                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--slate-900)" }}>{quiz.title}</h4>
                                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.15rem", flexWrap: "wrap" }}>
                                    <span>{quiz.question_count || quiz.questions?.length || 0} Questions</span>
                                    {quiz.pass_mark && <span>Pass Score: {quiz.pass_mark}%</span>}
                                    {quiz.time_limit && <span>Time: {quiz.time_limit} mins</span>}
                                  </div>
                                </div>
                              </div>

                              <Link to={`/my-courses/${id}/quizzes/${quiz.id}`} className="btn btn-primary btn-sm">
                                <span>Take Quiz</span>
                                <ArrowRight size={13} />
                              </Link>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "assignments" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <CheckSquare size={18} style={{ color: "var(--success)" }} />
                          <span>Course Assignments & Submissions</span>
                        </h4>
                        {assignments.length === 0 ? (
                          <div className="card" style={{ background: "var(--slate-50)", textAlign: "center", padding: "1.5rem" }}>
                            <CheckSquare size={28} style={{ color: "var(--slate-400)", marginBottom: "0.35rem" }} />
                            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>No assignments published yet for this course.</p>
                          </div>
                        ) : (
                          assignments.map((asg) => (
                            <div
                              key={asg.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.85rem 1.1rem",
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-md)",
                                gap: "1rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <CheckSquare size={18} />
                                </div>
                                <div>
                                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--slate-900)" }}>{asg.title}</h4>
                                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.15rem", flexWrap: "wrap" }}>
                                    {asg.total_points && <span>Points: {asg.total_points}</span>}
                                    {asg.due_date && <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>}
                                  </div>
                                </div>
                              </div>

                              <Link to={`/my-courses/${id}/assignments/${asg.id}`} className="btn btn-success btn-sm">
                                <span>Attempt / Submit</span>
                                <ArrowRight size={13} />
                              </Link>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "resources" && selectedLesson.pdf && (
                      <div className="card" style={{ background: "var(--slate-50)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <FileText size={24} style={{ color: "var(--primary)" }} />
                          <div>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Lesson PDF Resource Document</h4>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Download reference notes and guides for this lesson.</p>
                          </div>
                        </div>

                        <a href={getMediaUrl(selectedLesson.pdf)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                          Download PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Prev / Next Lesson Navigation Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.25rem", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
                  {prevLesson ? (
                    <button type="button" onClick={() => setSelectedLesson(prevLesson)} className="btn btn-secondary btn-sm">
                      <ArrowLeft size={15} />
                      <span>Previous: {prevLesson.title}</span>
                    </button>
                  ) : <div />}

                  {nextLesson ? (
                    (() => {
                      const isNextUnlocked = unlockedLessonIds.has(Number(nextLesson.id));
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isNextUnlocked) {
                              setMessage(`Please complete the current lesson video before proceeding to "${nextLesson.title}".`);
                              return;
                            }
                            proceedToNextLesson();
                          }}
                          disabled={!isNextUnlocked}
                          className={`btn btn-sm ${isNextUnlocked ? "btn-primary" : "btn-secondary"}`}
                          title={!isNextUnlocked ? "Complete current lesson video to unlock" : `Next: ${nextLesson.title}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            cursor: isNextUnlocked ? "pointer" : "not-allowed",
                            opacity: isNextUnlocked ? 1 : 0.65,
                          }}
                        >
                          {!isNextUnlocked ? (
                            <>
                              <Lock size={14} />
                              <span>Locked: {nextLesson.title}</span>
                            </>
                          ) : (
                            <>
                              <span>Next: {nextLesson.title}</span>
                              <ArrowRight size={15} />
                            </>
                          )}
                        </button>
                      );
                    })()
                  ) : isCourseComplete ? (
                    <Link to="/certificates" className="btn btn-primary btn-sm">
                      <Award size={15} />
                      <span>View Certificate 🎉</span>
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👈</div>
                <h3 className="empty-title">Select a lesson to start learning</h3>
                <p className="empty-desc">Choose any lesson from the course modules list on the left.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: "3rem 1rem" }}>
          <h3>No lessons found in this course</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>This course does not have any active lessons published yet.</p>
        </div>
      )}

      {/* Student Course Assessments & Submissions Hub Section */}
      <div id="assessments" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem", marginTop: "0.5rem" }}>
        {/* Student Quizzes Card */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <HelpCircle size={18} style={{ color: "var(--primary)" }} />
              <span>Quizzes & Knowledge Checks</span>
            </h3>
            {quizzes.length > 0 && <span className="badge badge-purple">{quizzes.length} Available</span>}
          </div>

          {quizzes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>No quizzes assigned yet for this course.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 0.85rem",
                    background: "var(--slate-50)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "var(--slate-900)" }}>{quiz.title}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                      {quiz.question_count || quiz.questions?.length || 0} Questions {quiz.time_limit ? `• ${quiz.time_limit} mins` : ""}
                    </div>
                  </div>

                  <Link to={`/my-courses/${id}/quizzes/${quiz.id}`} className="btn btn-primary btn-sm">
                    <span>Take Quiz</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Assignments Card */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckSquare size={18} style={{ color: "var(--success)" }} />
              <span>Assignments & Submissions</span>
            </h3>
            {assignments.length > 0 && <span className="badge badge-success">{assignments.length} Available</span>}
          </div>

          {assignments.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>No assignments posted yet for this course.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 0.85rem",
                    background: "var(--slate-50)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "var(--slate-900)" }}>{asg.title}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                      Max Score: {asg.max_score || asg.total_points || 100} {asg.due_date ? `• Due: ${new Date(asg.due_date).toLocaleDateString()}` : ""}
                    </div>
                  </div>

                  <Link to={`/my-courses/${id}/assignments/${asg.id}`} className="btn btn-success btn-sm">
                    <span>Attempt Work</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


