import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Zap,
  Star,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Play,
  ChevronRight,
  Globe,
  Clock,
  BarChart2,
  Layers,
  Target,
  Rocket,
} from "lucide-react";
import { listPublishedCourses } from "../features/courses/courseService.js";
import { CourseCard } from "../components/CourseCard.jsx";
import { CourseCardSkeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { useAuth } from "../features/auth/useAuth.js";
import {
  addToWishlist,
  removeFromWishlist,
  listWishlist,
} from "../features/wishlist/wishlistService.js";

/* ─── Animated Counter Hook ─── */
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ─── Stat Item Component ─── */
function StatItem({ icon: Icon, value, suffix = "", label, color, delay = 0, animate }) {
  const count = useCounter(value, 1800, animate);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1.5rem 1rem",
        animation: animate ? `statFadeUp 0.6s ${delay}ms both` : "none",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "var(--radius-md)",
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "0.25rem",
        }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <span
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--text-main)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {count}
        {suffix}
      </span>
      <span style={{ fontSize: "0.825rem", color: "var(--text-muted)", fontWeight: 500, textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, gradient, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "1.75rem",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
        overflow: "hidden",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Decorative gradient blob */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: gradient,
          opacity: hovered ? 0.15 : 0.07,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-md)",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          boxShadow: `0 4px 12px ${gradient.includes("6366f1") ? "rgba(99,102,241,0.3)" : gradient.includes("10b981") ? "rgba(16,185,129,0.3)" : gradient.includes("f59e0b") ? "rgba(245,158,11,0.3)" : "rgba(139,92,246,0.3)"}`,
        }}
      >
        <Icon size={22} color="#ffffff" />
      </div>
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--text-main)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "0.855rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({ step, icon: Icon, title, desc, color }) {
  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: `${color}18`,
            border: `2px solid ${color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            fontWeight: 800,
            fontSize: "1rem",
          }}
        >
          <Icon size={20} />
        </div>
        {step < 3 && (
          <div
            style={{
              width: "2px",
              height: "48px",
              background: `linear-gradient(to bottom, ${color}40, transparent)`,
              marginTop: "4px",
            }}
          />
        )}
      </div>
      <div style={{ paddingTop: "0.5rem" }}>
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.2rem",
          }}
        >
          Step {step}
        </div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.855rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Category Pill ─── */
function CategoryPill({ cat, emoji }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={`/courses?category=${encodeURIComponent(cat)}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1.2rem",
        borderRadius: "var(--radius-full)",
        background: hovered ? "var(--primary)" : "var(--bg-surface)",
        color: hovered ? "#ffffff" : "var(--text-secondary)",
        border: "1px solid",
        borderColor: hovered ? "var(--primary)" : "var(--border-color)",
        fontWeight: 600,
        fontSize: "0.85rem",
        textDecoration: "none",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: hovered ? "0 4px 12px rgba(99,102,241,0.25)" : "var(--shadow-xs)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <span>{emoji}</span>
      <span>{cat}</span>
    </Link>
  );
}

const CATEGORY_EMOJIS = {
  default: ["🎯", "💡", "🚀", "🌟", "📚", "🎨", "⚡", "🔬", "🏆", "🌍"],
};

/* ═══════════════ MAIN PAGE ════════════════ */
export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, access, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    listPublishedCourses({ page_size: 6 })
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setCourses(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load featured courses");
      })
      .finally(() => setLoading(false));

    if (isAuthenticated && access && role === "student") {
      listWishlist(access)
        .then((res) => {
          const items = Array.isArray(res) ? res : res?.results || [];
          const ids = new Set(items.map((item) => item.course?.id || item.course));
          setWishlistIds(ids);
        })
        .catch(() => null);
    }
  }, [isAuthenticated, access, role]);

  /* Intersection observer for stats animation */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/courses");
    }
  };

  const handleWishlistToggle = async (courseId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const isSaved = wishlistIds.has(courseId);
    try {
      if (isSaved) {
        await removeFromWishlist(courseId, access);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      } else {
        await addToWishlist(courseId, access);
        setWishlistIds((prev) => new Set(prev).add(courseId));
      }
    } catch {
      // Handle error gracefully
    }
  };

  const categories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean))
  );

  return (
    <>
      {/* Inline keyframe styles */}
      <style>{`
        @keyframes statFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(3deg); }
          66% { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes blob1 {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.15) translate(30px, -20px); }
        }
        @keyframes blob2 {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-25px, 30px); }
        }
        @keyframes blob3 {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.2) translate(15px, 25px); }
        }
        @keyframes shimmerBadge {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          100% { box-shadow: 0 0 0 16px rgba(99, 102, 241, 0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-text-col { animation: slideInLeft 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-visual-col { animation: slideInRight 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both; }
        .section-fade { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-search-input:focus { outline: none; }
        .explore-btn:hover { background: var(--primary) !important; color: #fff !important; border-color: var(--primary) !important; }
        .trust-bar-item { transition: transform 0.2s ease; }
        .trust-bar-item:hover { transform: scale(1.05); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>

        {/* ═══ HERO SECTION ═══ */}
        <section
          style={{
            position: "relative",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4c1d95 100%)",
            minHeight: "520px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "center",
            padding: "4rem 3.5rem",
          }}
        >
          {/* Animated blobs background */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{
              position: "absolute", top: "-80px", left: "-80px",
              width: "400px", height: "400px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
              animation: "blob1 8s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", bottom: "-100px", right: "10%",
              width: "500px", height: "500px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
              animation: "blob2 10s ease-in-out infinite",
            }} />
            <div style={{
              position: "absolute", top: "30%", right: "-60px",
              width: "300px", height: "300px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(217,70,239,0.25) 0%, transparent 70%)",
              animation: "blob3 7s ease-in-out infinite",
            }} />
            {/* Grid lines overlay */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
          </div>

          {/* LEFT: Text Content */}
          <div className="hero-text-col" style={{ position: "relative", zIndex: 2 }}>
            {/* Shimmer Badge */}
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 100%)",
                backgroundSize: "200% auto",
                animation: "shimmerBadge 3s linear infinite",
                border: "1px solid rgba(255,255,255,0.2)",
                marginBottom: "1.5rem",
                width: "fit-content",
              }}
            >
              <Sparkles size={14} style={{ color: "#fde047" }} />
              <span style={{ color: "#fde047", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Next-Gen Learning Platform
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.25rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                color: "#ffffff",
                marginBottom: "1.25rem",
              }}
            >
              Master New Skills.
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(90deg, #a5b4fc, #e879f9, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Build Your Future.
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: "500px",
              }}
            >
              Empower your career with expert-led interactive courses, hands-on
              assignments, and industry-recognized certificates — all in one
              powerful platform.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(20px)",
                padding: "0.35rem",
                borderRadius: "var(--radius-full)",
                maxWidth: "460px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                marginBottom: "1.75rem",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", paddingLeft: "1rem", flex: 1, gap: "0.5rem" }}>
                <Search size={16} style={{ color: "var(--slate-400)", flexShrink: 0 }} />
                <input
                  className="hero-search-input"
                  type="text"
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    width: "100%",
                    color: "#0f172a",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  borderRadius: "var(--radius-full)",
                  padding: "0.65rem 1.4rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                  transition: "all 0.2s",
                }}
              >
                Search
              </button>
            </form>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <Link
                to="/courses"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  transition: "all 0.2s",
                  animation: "pulseRing 2s 1s ease-out",
                }}
              >
                <span>Explore Courses</span>
                <ArrowRight size={16} />
              </Link>

              {isAuthenticated ? (
                <Link
                  to={role === "admin" ? "/admin" : role === "instructor" ? "/instructor" : "/dashboard"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.25)",
                    transition: "all 0.2s",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  Go to Dashboard
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.25)",
                    transition: "all 0.2s",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Play size={14} />
                  Start Free Today
                </Link>
              )}
            </div>

            {/* Trust Signals */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
              {[
                { icon: "⭐", text: "4.9/5 Rating" },
                { icon: "🎓", text: "10K+ Learners" },
                { icon: "✅", text: "Free to start" },
              ].map((t) => (
                <div
                  key={t.text}
                  className="trust-bar-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.825rem",
                    fontWeight: 500,
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Floating Dashboard Card Visual */}
          <div
            className="hero-visual-col"
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Main floating card */}
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                width: "100%",
                maxWidth: "340px",
                animation: "heroFloat 6s ease-in-out infinite",
                boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <GraduationCap size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>My Learning</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)" }}>3 courses in progress</div>
                </div>
              </div>

              {/* Progress bars */}
              {[
                { name: "React Masterclass", pct: 72, color: "#6366f1" },
                { name: "Python for Data Science", pct: 45, color: "#10b981" },
                { name: "UI/UX Fundamentals", pct: 88, color: "#f59e0b" },
              ].map((item) => (
                <div key={item.name} style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.775rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontSize: "0.75rem", color: item.color, fontWeight: 700 }}>{item.pct}%</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.12)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${item.pct}%`,
                      background: item.color,
                      borderRadius: "99px",
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: "1.25rem",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
              }}>
                <Award size={20} style={{ color: "#fde047" }} />
                <div>
                  <div style={{ fontSize: "0.775rem", fontWeight: 700, color: "#fff" }}>Certificate Earned!</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Advanced JavaScript • Today</div>
                </div>
                <div style={{ marginLeft: "auto", background: "#fde04720", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)", fontSize: "0.7rem", color: "#fde047", fontWeight: 700 }}>NEW</div>
              </div>
            </div>

            {/* Floating badge: Learners online */}
            <div style={{
              position: "absolute",
              bottom: "-10px",
              left: "-20px",
              background: "rgba(16,185,129,0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "var(--radius-md)",
              padding: "0.6rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <div style={{ display: "flex" }}>
                {["#6366f1", "#8b5cf6", "#10b981"].map((c, i) => (
                  <div key={i} style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: c, border: "2px solid rgba(255,255,255,0.8)",
                    marginLeft: i > 0 ? "-6px" : "0",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: "0.775rem", fontWeight: 700, color: "#fff" }}>
                1,240 learners online
              </span>
            </div>
          </div>
        </section>

        {/* ═══ STATS BAR ═══ */}
        <section ref={statsRef}>
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-md)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              overflow: "hidden",
            }}
          >
            {[
              { icon: Users, value: 10000, suffix: "+", label: "Active Learners", color: "#6366f1", delay: 0 },
              { icon: BookOpen, value: 500, suffix: "+", label: "Quality Courses", color: "#10b981", delay: 100 },
              { icon: Award, value: 98, suffix: "%", label: "Completion Rate", color: "#f59e0b", delay: 200 },
              { icon: Star, value: 4, suffix: ".9★", label: "Average Rating", color: "#e879f9", delay: 300 },
              { icon: Globe, value: 50, suffix: "+", label: "Countries Reached", color: "#38bdf8", delay: 400 },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  borderRight: i < 4 ? "1px solid var(--border-color)" : "none",
                }}
              >
                <StatItem {...stat} animate={statsVisible} />
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FEATURED COURSES ═══ */}
        <section className="section-fade">
          {/* Section header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  padding: "0.3rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.75rem",
                }}
              >
                <TrendingUp size={13} />
                <span>Handpicked Content</span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  letterSpacing: "-0.03em",
                  marginBottom: "0.35rem",
                }}
              >
                Featured Courses
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", maxWidth: "500px" }}>
                High-impact learning experiences curated for maximum skill retention.
              </p>
            </div>
            <Link
              to="/courses"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
                background: "var(--bg-surface)",
                transition: "all 0.2s",
                boxShadow: "var(--shadow-xs)",
              }}
              className="explore-btn"
            >
              <span>View All Courses</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="course-grid">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : courses.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 2rem",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-lg)",
                border: "2px dashed var(--border-color)",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={28} style={{ color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
                No published courses yet
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Check back soon for upcoming courses!
              </p>
            </div>
          ) : (
            <div className="course-grid">
              {courses.slice(0, 6).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onWishlistToggle={role === "student" ? handleWishlistToggle : null}
                  isWishlisted={wishlistIds.has(course.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ═══ CATEGORIES ═══ */}
        {categories.length > 0 && (
          <section className="section-fade">
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "var(--success-light)",
                  color: "var(--success)",
                  padding: "0.3rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.75rem",
                }}
              >
                <Layers size={13} />
                <span>Browse by Topic</span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  letterSpacing: "-0.03em",
                }}
              >
                Explore Topics
              </h2>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              {categories.map((cat, idx) => (
                <CategoryPill
                  key={cat}
                  cat={cat}
                  emoji={CATEGORY_EMOJIS.default[idx % CATEGORY_EMOJIS.default.length]}
                />
              ))}
            </div>
          </section>
        )}

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="section-fade">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            {/* Left content */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "#fef3c7",
                  color: "#d97706",
                  padding: "0.3rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                }}
              >
                <Rocket size={13} />
                <span>Simple Process</span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  letterSpacing: "-0.03em",
                  marginBottom: "0.5rem",
                }}
              >
                Start Learning in Minutes
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2.5rem", lineHeight: 1.6 }}>
                Our streamlined process makes it effortless to go from sign-up to skill mastery.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <StepCard
                  step={1}
                  icon={Target}
                  title="Pick Your Goal"
                  desc="Browse our curated catalog and find courses that match your ambitions and skill level."
                  color="#6366f1"
                />
                <StepCard
                  step={2}
                  icon={Play}
                  title="Learn Interactively"
                  desc="Engage with video lessons, quizzes, coding assignments, and real-world projects."
                  color="#10b981"
                />
                <StepCard
                  step={3}
                  icon={Award}
                  title="Earn Your Certificate"
                  desc="Get a verified certificate that showcases your achievement to employers worldwide."
                  color="#f59e0b"
                />
              </div>
            </div>

            {/* Right: visual stats card stack */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-color)",
                  padding: "2rem",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BarChart2 size={18} style={{ color: "var(--primary)" }} />
                  Learning Outcomes
                </h3>
                {[
                  { label: "Career Advancement", pct: 87, color: "#6366f1" },
                  { label: "Salary Increase", pct: 72, color: "#10b981" },
                  { label: "Job Placement", pct: 94, color: "#f59e0b" },
                  { label: "Skill Confidence", pct: 96, color: "#e879f9" },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>{item.label}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: item.color }}>{item.pct}%</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${item.pct}%`,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                        borderRadius: "99px",
                      }} />
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "var(--primary-light)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Clock size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary)" }}>
                      Avg. 4 months to career switch
                    </div>
                    <div style={{ fontSize: "0.775rem", color: "var(--primary)", opacity: 0.7 }}>
                      Based on 5,000+ learner outcomes
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <div
                style={{
                  position: "absolute",
                  top: "-24px",
                  right: "-24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  boxShadow: "var(--shadow-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  maxWidth: "220px",
                }}
              >
                <div style={{ display: "flex", gap: "1px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                  ))}
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  "Changed my career completely!"
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHY CHOOSE US (FEATURES) ═══ */}
        <section className="section-fade">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#f5f3ff",
                color: "#8b5cf6",
                padding: "0.3rem 0.85rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.75rem",
              }}
            >
              <ShieldCheck size={13} />
              <span>Platform Features</span>
            </div>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.03em",
                marginBottom: "0.5rem",
              }}
            >
              Everything You Need to Succeed
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "540px", margin: "0 auto" }}>
              Built for ambitious learners, top instructors, and growing educational teams.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <FeatureCard
              icon={GraduationCap}
              title="Expert Curriculum"
              desc="Structured learning pathways crafted by top industry leaders and educators worldwide."
              gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
              delay={0}
            />
            <FeatureCard
              icon={Zap}
              title="Interactive Quizzes"
              desc="Reinforce retention with immediate feedback quizzes, coding challenges, and practical tasks."
              gradient="linear-gradient(135deg, #10b981, #059669)"
              delay={100}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Verified Certificates"
              desc="Earn shareable certificates to showcase your expertise on LinkedIn and resumes."
              gradient="linear-gradient(135deg, #8b5cf6, #d946ef)"
              delay={200}
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Lifetime Access"
              desc="Learn on your schedule with unlimited access across all your devices, forever."
              gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
              delay={300}
            />
          </div>
        </section>

        {/* ═══ FINAL CTA BANNER ═══ */}
        <section className="section-fade">
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
              padding: "4rem 3rem",
              textAlign: "center",
            }}
          >
            {/* Background decoration */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
              <div style={{
                position: "absolute", top: "-60px", left: "10%",
                width: "300px", height: "300px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
              }} />
              <div style={{
                position: "absolute", bottom: "-80px", right: "15%",
                width: "350px", height: "350px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(217,70,239,0.35) 0%, transparent 70%)",
              }} />
            </div>

            <div style={{ position: "relative", zIndex: 2 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(253,224,71,0.15)",
                  border: "1px solid rgba(253,224,71,0.3)",
                  padding: "0.4rem 1rem",
                  borderRadius: "var(--radius-full)",
                  marginBottom: "1.5rem",
                }}
              >
                <Sparkles size={14} style={{ color: "#fde047" }} />
                <span style={{ color: "#fde047", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Limited Time — Free Access
                </span>
              </div>

              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.04em",
                  marginBottom: "1rem",
                  lineHeight: 1.15,
                }}
              >
                Ready to Transform
                <br />
                <span style={{
                  backgroundImage: "linear-gradient(90deg, #a5b4fc, #e879f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Your Career?
                </span>
              </h2>

              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
                Join thousands of learners who've accelerated their careers with
                LMS. Start learning for free today — no credit card needed.
              </p>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  to={isAuthenticated ? "/courses" : "/register"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.9rem 2rem",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #fde047, #f59e0b)",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    boxShadow: "0 8px 24px rgba(245,158,11,0.45)",
                    transition: "all 0.2s",
                  }}
                >
                  {isAuthenticated ? "Browse Courses" : "Get Started Free"}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/courses"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.9rem 2rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.2s",
                  }}
                >
                  <BookOpen size={18} />
                  Explore Catalog
                </Link>
              </div>

              {/* Social proof line */}
              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.825rem",
                }}
              >
                <div style={{ display: "flex" }}>
                  {["#6366f1", "#8b5cf6", "#10b981", "#f59e0b"].map((c, i) => (
                    <div key={i} style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: c, border: "2px solid rgba(255,255,255,0.4)",
                      marginLeft: i > 0 ? "-8px" : "0",
                    }} />
                  ))}
                </div>
                <span>Join 10,000+ learners already on the platform</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
