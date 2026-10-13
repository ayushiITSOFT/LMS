import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, CheckCircle, Clock, Award, BookOpen, ArrowRight, History, Calendar, ShoppingBag, PlayCircle } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { getStudentDashboard, listEnrollments } from "../features/enrollment/enrollmentService.js";
import { listOrders } from "../features/orders/orderService.js";
import { StatCard } from "../components/StatCard.jsx";
import { StatCardSkeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { getMediaUrl } from "../utils/mediaUrl.js";

export function StudentDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getStudentDashboard().catch(() => null),
      listEnrollments().catch(() => []),
      listOrders().catch(() => []),
    ])
      .then(([dash, enrolls, ords]) => {
        setDashboardData(dash);
        setEnrollments(Array.isArray(enrolls) ? enrolls : enrolls?.results || []);
        setOrders(Array.isArray(ords) ? ords : ords?.results || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load student dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Student";
  const activeCourse = enrollments.length > 0 ? enrollments[0]?.course : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Page/Welcome Section */}
      <div className="hero-section">
        <div>
          <h1 className="hero-title">Welcome back, {displayName}</h1>
          <p className="hero-subtitle">
            Track your study progress, access active courses, and stay on top of assignment deadlines.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          {/* 2. Important KPI / Stat Cards */}
          <div className="stats-grid">
            <StatCard
              title="Enrolled Courses"
              value={dashboardData?.total_enrolled_courses ?? enrollments.length}
              icon={GraduationCap}
              variant="primary"
            />
            <StatCard
              title="In Progress"
              value={dashboardData?.courses_in_progress ?? 0}
              icon={Clock}
              variant="warning"
            />
            <StatCard
              title="Completed Courses"
              value={dashboardData?.completed_courses ?? 0}
              icon={CheckCircle}
              variant="success"
            />
            <StatCard
              title="Certificates Earned"
              value={dashboardData?.certificates_earned ?? 0}
              icon={Award}
              variant="info"
            />
          </div>

          {/* 3. Primary Activity Section (Quick Resume) */}
          {activeCourse && (
            <section className="ui-card" style={{ background: "var(--slate-900)", color: "#ffffff", border: "1px solid var(--slate-800)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                    <PlayCircle size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase" }}>Primary Action • Continue Learning</div>
                    <h3 className="h3" style={{ color: "#ffffff", fontSize: "1.15rem", margin: "0.1rem 0" }}>{activeCourse.title || "Untitled Course"}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--slate-300)" }}>Pick up right where you left off</p>
                  </div>
                </div>
                <Link to={`/my-courses/${activeCourse.id || enrollments[0]?.id}`} className="btn btn-secondary">
                  Resume Course <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          )}

          {/* 4. Courses / Learning Progress Grid */}
          <section className="ui-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h2 className="h3">Learning Progress</h2>
                <p className="text-subtitle">Your active course enrollments and study status</p>
              </div>
              <Link to="/my-courses" className="btn btn-outline btn-sm">
                View All Courses <ArrowRight size={14} />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No active enrollments yet"
                description="Explore our course catalog to start learning today."
                action={<Link to="/courses" className="btn btn-primary btn-sm">Browse Catalog</Link>}
              />
            ) : (
              <div className="course-grid">
                {enrollments.slice(0, 4).map((enrollment) => {
                  const course = enrollment.course || {};
                  return (
                    <div key={enrollment.id} className="course-card-ui">
                      <div className="course-card-thumb-wrap">
                        <img
                          src={getMediaUrl(course.image || course.thumbnail)}
                          alt={course.title}
                          className="course-card-thumb"
                        />
                        {course.level && <span className="course-badge-level">{course.level}</span>}
                      </div>

                      <div className="course-card-content">
                        {course.category && <div className="course-category-tag">{course.category}</div>}
                        <h4 className="course-card-title">{course.title || "Untitled Course"}</h4>
                        <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                            Enrolled {new Date(enrollment.created_at || Date.now()).toLocaleDateString()}
                          </span>
                          <Link to={`/my-courses/${course.id || enrollment.id}`} className="btn btn-primary btn-sm">
                            Resume
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 5 & 6. Two-Column Row: Recent Activity & Upcoming Tasks / Deadlines */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {/* 5. Recent Activity */}
            <section className="ui-card">
              <h2 className="h3" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <History size={18} style={{ color: "var(--primary)" }} />
                <span>Recent Learning Activity</span>
              </h2>

              {(!dashboardData?.recent_activity || dashboardData.recent_activity.length === 0) ? (
                <p className="text-subtitle">No recent activity logged yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {dashboardData.recent_activity.map((act, i) => (
                    <div key={i} style={{ padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                        {act.message}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                        {act.timestamp ? new Date(act.timestamp).toLocaleString() : "Recently"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 6. Upcoming Tasks / Deadlines */}
            <section className="ui-card">
              <h2 className="h3" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={18} style={{ color: "var(--warning)" }} />
                <span>Upcoming Assignment Deadlines</span>
              </h2>

              {(!dashboardData?.upcoming_deadlines || dashboardData.upcoming_deadlines.length === 0) ? (
                <EmptyState
                  icon={CheckCircle}
                  title="All caught up!"
                  description="You have no pending assignment deadlines at the moment."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {dashboardData.upcoming_deadlines.map((item, i) => (
                    <div key={i} style={{ padding: "0.75rem 0.85rem", borderLeft: "3px solid var(--warning)", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Course: {item.course_title}</div>
                      <div style={{ fontSize: "0.775rem", color: "var(--danger)", fontWeight: 600, marginTop: "0.2rem" }}>
                        Due: {new Date(item.due_date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 7. Notifications or Order History */}
          <section className="ui-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 className="h3" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShoppingBag size={18} style={{ color: "var(--slate-700)" }} />
                <span>Recent Orders & Transactions</span>
              </h2>
              <Link to="/orders" className="btn btn-outline btn-sm">
                View All Orders
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-subtitle">No order history recorded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.85rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Order #{o.id}</div>
                      <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : ""} • ${Number(o.total_amount || 0).toFixed(2)}
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
