import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Star,
  BookOpen,
  User,
  Globe,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Lock,
  CheckCircle2,
  ShoppingCart,
  Heart,
  Pencil,
  Wrench,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { addToCart, listCart, removeFromCart } from "../features/cart/cartService.js";
import { CoursePublishPanel } from "../features/courses/CoursePublishPanel.jsx";
import { deleteCourse, getCourse, listPublishedCourses, listSections } from "../features/courses/courseService.js";
import { listEnrollments } from "../features/enrollment/enrollmentService.js";
import { addToWishlist, listWishlist, removeFromWishlist } from "../features/wishlist/wishlistService.js";
import { listCourseReviews, createCourseReview } from "../features/reviews/reviewService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { getMediaUrl } from "../utils/mediaUrl.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access, role, user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const [isInCart, setIsInCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Expanded sections accordion state (default section 0 open)
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    const fetchCourseData = getCourse(id, access).catch(async () => {
      const res = await listPublishedCourses({ page_size: 100 });
      const items = Array.isArray(res) ? res : res?.results || [];
      const found = items.find((item) => Number(item.id) === Number(id));
      if (found) return found;
      throw new Error("Course not found or access restricted.");
    });

    Promise.all([
      fetchCourseData,
      listSections(id, access).catch(() => []),
      listCourseReviews(id).catch(() => []),
    ])
      .then(([courseData, sectionsData, reviewsData]) => {
        if (!active) return;
        setCourse(courseData);
        const secFromEndpoint = Array.isArray(sectionsData) ? sectionsData : sectionsData?.results || [];
        const secFromCourse = Array.isArray(courseData?.sections) ? courseData.sections : [];
        const secList = secFromEndpoint.length > 0 ? secFromEndpoint : secFromCourse;
        setSections(secList);
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData?.results || []);
        
        // Auto-expand all sections if <= 3, otherwise expand first
        const initialExpanded = {};
        secList.forEach((_, idx) => {
          if (idx < 2) initialExpanded[idx] = true;
        });
        setExpandedSections(initialExpanded);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load course details.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, id]);

  useEffect(() => {
    if (!isAuthenticated || role !== ROLES.STUDENT) return;

    let active = true;
    Promise.all([
      listCart(access).catch(() => []),
      listWishlist(access).catch(() => []),
      listEnrollments(access).catch(() => []),
    ]).then(([cartItems, wishlistItems, enrollments]) => {
      if (!active) return;
      const cItems = Array.isArray(cartItems) ? cartItems : cartItems?.items || [];
      const wItems = Array.isArray(wishlistItems) ? wishlistItems : wishlistItems?.results || [];
      const eItems = Array.isArray(enrollments) ? enrollments : enrollments?.results || [];

      setIsInCart(cItems.some((item) => Number(item.course) === Number(id)));
      setIsWishlisted(wItems.some((item) => Number(item.course) === Number(id)));
      setIsEnrolled(eItems.some((item) => Number(item.course?.id || item.course) === Number(id)));
    });

    return () => {
      active = false;
    };
  }, [access, id, isAuthenticated, role]);

  const instructorId = typeof course?.instructor === "object" ? course?.instructor?.id : course?.instructor;
  const ownerName = typeof course?.instructor === "object" ? course?.instructor?.username : course?.instructor;

  const isCourseOwner =
    user?.id && instructorId && Number(instructorId) === Number(user.id);
  const isUsernameMatch =
    user?.username && ownerName && String(ownerName).toLowerCase() === String(user.username).toLowerCase();

  const canManage =
    role === ROLES.ADMIN || (role === ROLES.INSTRUCTOR && (isCourseOwner || isUsernameMatch || !instructorId));

  function toggleAccordion(idx) {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id, access);
      navigate("/courses", { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to delete course.");
    }
  }

  async function toggleWishlist() {
    if (!isAuthenticated) return navigate("/login");
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(id, access);
      } else {
        await addToWishlist(id, access);
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      setMessage(err.message || "Wishlist action failed.");
    } finally {
      setWishlistLoading(false);
    }
  }

  async function toggleCart() {
    if (!isAuthenticated) return navigate("/login");
    setCartLoading(true);
    try {
      if (isInCart) {
        await removeFromCart(id, access);
      } else {
        await addToCart(id, access);
      }
      setIsInCart(!isInCart);
    } catch (err) {
      setMessage(err.message || "Cart action failed.");
    } finally {
      setCartLoading(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const newReview = await createCourseReview(id, { rating, comment }, access);
      setReviews((prev) => [newReview, ...prev]);
      setComment("");
    } catch (err) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <Skeleton height="200px" />
        <Skeleton height="40px" width="300px" />
        <Skeleton height="150px" />
      </div>
    );
  }

  if (status === "error" || !course) {
    return <ErrorState message={message || "Course details not found."} onRetry={() => navigate("/courses")} />;
  }

  const priceFormatted = Number(course.price || 0) > 0 ? formatCurrency(course.price) : "Free";
  const rawInstructor = course.instructor?.username || course.instructor_name || course.instructor;
  const instructorName = typeof rawInstructor === "string" ? rawInstructor : (rawInstructor ? `Instructor #${rawInstructor}` : "Expert Instructor");
  const totalLessons = sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Learning Journey Breadcrumb */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Link to="/courses" style={{ color: "var(--slate-600)", textDecoration: "none" }}>Courses</Link>
        <span>/</span>
        <span>{course.category || "General"}</span>
        <span>/</span>
        <span style={{ color: "var(--slate-900)", fontWeight: 600 }}>{course.title}</span>
      </div>

      {/* Hero Header & Purchase Sidebar Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        {/* Left Hero Main Box */}
        <div className="card" style={{ background: "var(--slate-900)", color: "#ffffff", padding: "2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <span className="badge badge-info">{course.category || "General"}</span>
            <span className="badge badge-warning">{course.level || "All Levels"}</span>
            <StatusBadge status={course.status} />
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.75rem", lineHeight: "1.25", color: "#ffffff" }}>
            {course.title}
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            {course.subtitle || course.description}
          </p>

          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", color: "#cbd5e1", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <User size={15} style={{ color: "var(--primary)" }} />
              <span>Instructor: <strong>{instructorName}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Globe size={15} style={{ color: "var(--primary)" }} />
              <span>Language: <strong>{course.language || "English"}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <BookOpen size={15} style={{ color: "var(--primary)" }} />
              <span>{sections.length} Modules ({totalLessons} Lessons)</span>
            </div>
          </div>
        </div>

        {/* Right Pricing / Call To Action Box */}
        <div className="card" style={{ position: "sticky", top: "80px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="course-card-thumb-wrap" style={{ height: "180px", borderRadius: "var(--radius-md)" }}>
            <img
              src={getMediaUrl(course.image || course.thumbnail)}
              alt={course.title}
              className="course-card-thumb"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--slate-900)" }}>
              {priceFormatted}
            </span>
          </div>

          {role === ROLES.ADMIN ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <span className="badge badge-info" style={{ textAlign: "center", padding: "0.5rem", background: "#1e1b4b", color: "#ffffff", fontSize: "0.8rem" }}>
                👁️ Admin View-Only Mode
              </span>
              <Link to={`/instructor/courses/${course.id}/builder`} className="btn btn-primary btn-lg" style={{ width: "100%", textDecoration: "none" }}>
                <Eye size={18} />
                <span>Inspect Curriculum Structure</span>
              </Link>
            </div>
          ) : canManage ? (
            <Link to={`/instructor/courses/${course.id}/builder`} className="btn btn-primary btn-lg" style={{ width: "100%", textDecoration: "none" }}>
              <Wrench size={18} />
              <span>Manage in Course Builder</span>
            </Link>
          ) : isEnrolled ? (
            <Link to={`/my-courses/${course.id}`} className="btn btn-primary btn-lg" style={{ width: "100%", textDecoration: "none" }}>
              <span>Continue Learning</span>
              <ArrowRight size={18} />
            </Link>
          ) : role === ROLES.STUDENT || !isAuthenticated ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <button
                type="button"
                onClick={toggleCart}
                disabled={cartLoading}
                className="btn btn-primary btn-lg"
                style={{ width: "100%" }}
              >
                <ShoppingCart size={18} />
                <span>{isInCart ? "In Cart (Remove)" : "Add to Cart"}</span>
              </button>
              
              <button
                type="button"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className="btn btn-outline"
                style={{ width: "100%" }}
              >
                <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} style={{ color: isWishlisted ? "#ef4444" : "inherit" }} />
                <span>{isWishlisted ? "Saved in Wishlist" : "Save to Wishlist"}</span>
              </button>
            </div>
          ) : null}

          {/* Value props checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", fontSize: "0.825rem", color: "var(--slate-600)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ShieldCheck size={14} style={{ color: "var(--success)" }} />
              <span>Full lifetime access to all lessons</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <BookOpen size={14} style={{ color: "var(--success)" }} />
              <span>{totalLessons} video & text resources</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
              <span>Verified Certificate upon completion</span>
            </div>
          </div>

          {canManage && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-400)", letterSpacing: "0.5px" }}>
                Creator Actions
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <Link to={`/instructor/courses/${course.id}/edit`} className="btn btn-secondary btn-sm">
                  <Pencil size={14} />
                  <span>Edit</span>
                </Link>
                <Link to={`/instructor/courses/${course.id}/builder`} className="btn btn-secondary btn-sm">
                  <Wrench size={14} />
                  <span>Builder</span>
                </Link>
                <Link to={`/courses/${course.id}/preview`} className="btn btn-outline btn-sm">
                  <Eye size={14} />
                  <span>Preview</span>
                </Link>
              </div>
              <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm" style={{ width: "100%" }}>
                <Trash2 size={14} />
                <span>Delete Course</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {message && <div style={{ color: "var(--danger)", fontWeight: 600 }}>{message}</div>}

      {/* Overview & Description Section */}
      <section className="card">
        <h2 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "1rem" }}>About This Course</h2>
        <p style={{ color: "var(--slate-700)", lineHeight: "1.7", whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
          {course.description || "No full description provided for this course."}
        </p>
      </section>

      {/* Course Curriculum & Expandable Modules Section */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800" }}>Course Content</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {sections.length} modules • {totalLessons} lessons
            </p>
          </div>
        </div>

        {sections.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {isEnrolled
              ? "No curriculum sections published yet."
              : "Enroll in this course to unlock complete curriculum sections and lessons."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {sections.map((section, idx) => {
              const isExpanded = !!expandedSections[idx];
              const lessonCount = section.lessons?.length || 0;

              return (
                <div key={section.id || idx} style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  {/* Module Header Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="section-header-btn"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span className={`accordion-chevron ${isExpanded ? "expanded" : ""}`}>
                        <ChevronDown size={16} />
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        Module {idx + 1}: {section.title}
                      </span>
                    </div>

                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
                    </span>
                  </button>

                  {/* Lessons List inside Module */}
                  {isExpanded && section.lessons && section.lessons.length > 0 && (
                    <div className="lesson-list">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`lesson-item ${!isEnrolled ? "locked" : ""}`}
                          style={{ padding: "0.75rem 1.25rem" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                            {lesson.kind === "video" || lesson.video_url ? (
                              <Video size={15} style={{ color: "var(--slate-500)" }} />
                            ) : (
                              <FileText size={15} style={{ color: "var(--slate-500)" }} />
                            )}
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{lesson.title}</span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                              {lesson.duration || lesson.kind || "Lesson"}
                            </span>
                            {!isEnrolled && <Lock size={14} style={{ color: "var(--slate-400)" }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Instructor Information Section */}
      <section className="card">
        <h2 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "1rem" }}>Instructor Profile</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "var(--slate-100)",
              color: "var(--slate-800)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              fontWeight: 800,
            }}
          >
            {String(instructorName).charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{instructorName}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Course Instructor & Subject Specialist</p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="card">
        <h2 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "1.25rem" }}>Student Reviews</h2>

        {isEnrolled && (
          <form onSubmit={handleReviewSubmit} className="card" style={{ background: "var(--slate-50)", marginBottom: "1.75rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.75rem" }}>Leave your rating & review</h3>
            {reviewError && <p style={{ color: "var(--danger)", marginBottom: "0.5rem", fontSize: "0.85rem" }}>{reviewError}</p>}
            
            <div className="form-group">
              <label className="form-label">Rating Score</label>
              <select className="select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5 Very Good)</option>
                <option value={3}>⭐⭐⭐ (3/5 Good)</option>
                <option value={2}>⭐⭐ (2/5 Fair)</option>
                <option value={1}>⭐ (1/5 Poor)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Review Comment</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Share your learning experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={reviewSubmitting} className="btn btn-primary btn-sm">
              Submit Review
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No reviews submitted yet for this course.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{rev.user?.username || rev.student || "Student"}</span>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={13}
                        fill={starIdx <= rev.rating ? "#f59e0b" : "none"}
                        style={{ color: starIdx <= rev.rating ? "#f59e0b" : "var(--slate-300)" }}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ color: "var(--slate-700)", fontSize: "0.875rem", lineHeight: "1.5" }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {canManage && (
        <section className="card">
          <CoursePublishPanel course={course} onPublished={setCourse} token={access} />
        </section>
      )}
    </div>
  );
}
