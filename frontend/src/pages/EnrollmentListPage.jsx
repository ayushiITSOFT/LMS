import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listEnrollments } from "../features/enrollment/enrollmentService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

export function EnrollmentListPage() {
  const { access } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!access) return;
    setLoading(true);

    listEnrollments(access)
      .then((data) => {
        setEnrollments(itemsFrom(data));
      })
      .catch((err) => {
        setError(err.message || "Unable to load enrolled courses.");
      })
      .finally(() => setLoading(false));
  }, [access]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>My Enrolled Courses</h1>
          <p style={{ color: "var(--text-muted)" }}>Access your active learning curriculum and progress.</p>
        </div>
        <Link className="btn btn-primary" to="/courses">
          Browse Marketplace
        </Link>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No Enrolled Courses"
          description="You are not enrolled in any courses yet. Browse our course catalog to get started!"
          actionText="Explore Courses"
          actionLink="/courses"
          icon="🎓"
        />
      ) : (
        <div className="course-grid">
          {enrollments.map((enrollment) => {
            const course = enrollment.course || {};
            const courseId = course.id || enrollment.course;
            return (
              <div key={enrollment.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
                <span className="course-category">{course.category || "Course"}</span>
                <h3 className="course-title" style={{ marginTop: "0.25rem" }}>{course.title || "Enrolled Course"}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Enrolled on {new Date(enrollment.created_at || Date.now()).toLocaleDateString()}
                </p>

                <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-success">Active Access</span>
                  <Link to={`/my-courses/${courseId}`} className="btn btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                    Continue Learning →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
