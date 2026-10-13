import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, Check, BookOpen, ArrowRight, User } from "lucide-react";
import { getMediaUrl } from "../utils/mediaUrl.js";

export function CourseCard({
  course,
  onWishlistToggle,
  onAddToCart,
  isWishlisted,
  isInCart,
  isEnrolled,
  progress = null,
}) {
  if (!course) return null;

  const priceFormatted = course.price && Number(course.price) > 0 ? `$${Number(course.price).toFixed(2)}` : "Free";
  const rating = course.average_rating || course.rating || null;
  const instructorName = course.instructor?.username || course.instructor_name || course.instructor || "Instructor";
  const progressVal = progress ?? course.progress_percentage ?? course.progress ?? null;
  const isCompleted = progressVal !== null && Number(progressVal) >= 100;
  const imageUrl = getMediaUrl(course.image || course.thumbnail);

  return (
    <div className="course-card-ui">
      {/* Thumbnail & Badges */}
      <div className="course-card-thumb-wrap">
        <img
          src={imageUrl}
          alt={course.title}
          className="course-card-thumb"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
          }}
        />
        {course.level && (
          <span className="course-badge-level">{course.level}</span>
        )}
      </div>

      {/* Content Body */}
      <div className="course-card-content">
        {course.category && (
          <div className="course-category-tag">{course.category}</div>
        )}
        
        <h3 className="course-card-title" title={course.title}>
          {course.title}
        </h3>

        {/* Instructor Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
          <div style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "var(--slate-100)",
            color: "var(--slate-600)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontWeight: 700
          }}>
            <User size={12} />
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {instructorName}
          </span>
        </div>

        {/* Rating & Lessons metadata */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          {rating !== null ? (
            <div className="course-rating-row" style={{ marginBottom: 0 }}>
              <Star size={13} fill="#f59e0b" style={{ color: "#f59e0b" }} />
              <span style={{ fontWeight: 700, color: "var(--slate-800)", fontSize: "0.825rem" }}>
                {Number(rating).toFixed(1)}
              </span>
              {course.review_count !== undefined && (
                <span style={{ color: "var(--text-muted)", fontSize: "0.775rem" }}>
                  ({course.review_count})
                </span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Newly Listed</div>
          )}

          {course.lessons_count || course.section_count ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.775rem", color: "var(--text-muted)" }}>
              <BookOpen size={12} />
              <span>{course.lessons_count ? `${course.lessons_count} lessons` : `${course.section_count} sections`}</span>
            </div>
          ) : null}
        </div>

        {/* Enrolled Progress Indicator */}
        {(isEnrolled || progressVal !== null) && (
          <div style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600 }}>
              <span style={{ color: isCompleted ? "var(--success)" : "var(--slate-600)" }}>
                {isCompleted ? "Completed 🎉" : "Progress"}
              </span>
              <span style={{ color: "var(--slate-800)" }}>{Math.round(Number(progressVal || 0))}%</span>
            </div>
            <div className="progress-bar-ui" style={{ height: "6px" }}>
              <div
                className={`progress-bar-fill ${isCompleted ? "success" : ""}`}
                style={{ width: `${Math.min(100, Math.max(0, Number(progressVal || 0)))}%` }}
              />
            </div>
          </div>
        )}

        {/* Card Footer (Price & CTAs) */}
        <div className="course-card-bottom">
          <div className={`course-price-tag ${priceFormatted === "Free" ? "free" : ""}`}>
            {priceFormatted}
          </div>

          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {onWishlistToggle && !isEnrolled && (
              <button
                type="button"
                onClick={() => onWishlistToggle(course.id)}
                className="btn btn-secondary btn-sm"
                style={{ padding: "0.45rem", borderRadius: "var(--radius-full)" }}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart
                  size={15}
                  fill={isWishlisted ? "#ef4444" : "none"}
                  style={{ color: isWishlisted ? "#ef4444" : "var(--slate-400)" }}
                />
              </button>
            )}

            {onAddToCart && !isEnrolled && (
              <button
                type="button"
                onClick={() => onAddToCart(course.id)}
                className={`btn btn-sm ${isInCart ? "btn-secondary" : "btn-outline"}`}
                style={{ padding: "0.45rem", borderRadius: "var(--radius-full)" }}
                title={isInCart ? "In Cart" : "Add to Cart"}
              >
                {isInCart ? <Check size={15} style={{ color: "var(--success)" }} /> : <ShoppingCart size={15} />}
              </button>
            )}

            {isEnrolled ? (
              <Link to={`/my-courses/${course.id}`} className="btn btn-primary btn-sm">
                <span>Continue</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <Link to={`/courses/${course.id}`} className="btn btn-outline btn-sm">
                View
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

