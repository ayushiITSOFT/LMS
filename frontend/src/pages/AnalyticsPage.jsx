import { useCallback, useEffect, useRef, useState } from "react";
import { BarChart3, Award, FileCheck, Activity, TrendingUp, DollarSign, ArrowUpRight, RefreshCw } from "lucide-react";
import {
  getCourseCompletionRate,
  getEnrollmentTrends,
  getRevenueTrends,
  getQuizPerformance,
  getAssignmentPerformance,
  getStudentActivity,
} from "../features/analytics/analyticsService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

export function AnalyticsPage() {
  const [completionData, setCompletionData] = useState(null);
  const [enrollmentTrends, setEnrollmentTrends] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState(null);
  const [quizPerf, setQuizPerf] = useState(null);
  const [assignmentPerf, setAssignmentPerf] = useState(null);
  const [studentActivity, setStudentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const results = await Promise.allSettled([
        getCourseCompletionRate(),
        getEnrollmentTrends(),
        getRevenueTrends(),
        getQuizPerformance(),
        getAssignmentPerformance(),
        getStudentActivity(),
      ]);
      const labels = [
        "Course completion",
        "Enrollment trends",
        "Revenue trends",
        "Quiz performance",
        "Assignment performance",
        "Student activity",
      ];
      const failedResults = results
        .map((result, index) => ({ result, label: labels[index] }))
        .filter(({ result }) => result.status === "rejected")
        .map(({ result, label }) => `${label}: ${result.reason?.message || "Unable to load data."}`);

      if (results[0].status === "fulfilled") setCompletionData(results[0].value);
      if (results[1].status === "fulfilled") setEnrollmentTrends(results[1].value);
      if (results[2].status === "fulfilled") setRevenueTrends(results[2].value);
      if (results[3].status === "fulfilled") setQuizPerf(results[3].value);
      if (results[4].status === "fulfilled") setAssignmentPerf(results[4].value);
      if (results[5].status === "fulfilled") setStudentActivity(results[5].value);

      setError(failedResults.length ? failedResults.join(" ") : null);
    } catch (err) {
      setError(err.message || "Failed to load platform analytics.");
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const intervalId = window.setInterval(() => fetchAnalytics(true), 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchAnalytics]);

  if (loading) return <Skeleton height="400px" />;
  if (error && !completionData && !enrollmentTrends && !revenueTrends && !quizPerf && !assignmentPerf && !studentActivity) {
    return <ErrorState message={error} onRetry={() => fetchAnalytics()} />;
  }

  const courseCompletionColumns = [
    { header: "Course ID", accessor: "course_id" },
    { header: "Course Title", accessor: "course_title", cell: (r) => <strong>{r.course_title}</strong> },
    { header: "Total Enrollments", accessor: "total_enrollments" },
    { header: "Completed Enrollments", accessor: "completed_enrollments" },
    { header: "Completion Rate", accessor: "completion_rate", cell: (r) => <span style={{ color: "var(--success)", fontWeight: 700 }}>{r.completion_rate}%</span> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Page/Welcome Section */}
      <div className="hero-section">
        <div>
          <h1 className="hero-title">Platform Analytics</h1>
          <p className="hero-subtitle">
            Performance metrics, course completion rates, quiz scores, and revenue trends. Data refreshes every 30 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          <span>{refreshing ? "Refreshing..." : "Refresh Analytics"}</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="ui-card" style={{ color: "#b91c1c", border: "1px solid #fecaca" }}>
          Some analytics data could not be loaded: {error}
        </div>
      )}

      {/* 2. Important KPI / Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card-ui">
          <div>
            <div className="stat-lbl">Overall Completion Rate</div>
            <div className="stat-val">{completionData?.overall_completion_rate ? `${completionData.overall_completion_rate}%` : "0%"}</div>
          </div>
          <div className="stat-icon-wrapper primary"><BarChart3 size={22} /></div>
        </div>

        <div className="stat-card-ui">
          <div>
            <div className="stat-lbl">Average Quiz Score</div>
            <div className="stat-val">{quizPerf?.average_score ? `${quizPerf.average_score}%` : "0%"}</div>
          </div>
          <div className="stat-icon-wrapper success"><Award size={22} /></div>
        </div>

        <div className="stat-card-ui">
          <div>
            <div className="stat-lbl">Assignment Submissions</div>
            <div className="stat-val">{assignmentPerf?.total_submissions ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper info"><FileCheck size={22} /></div>
        </div>

        <div className="stat-card-ui">
          <div>
            <div className="stat-lbl">Submitted Quiz Attempts</div>
            <div className="stat-val">{quizPerf?.total_attempts ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper warning"><Activity size={22} /></div>
        </div>
      </div>

      {/* 3. Primary Activity / Insight Section */}
      <section className="ui-card" style={{ background: "var(--slate-900)", color: "#ffffff", border: "1px solid var(--slate-800)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase" }}>Primary Insights Summary</div>
            <h3 className="h3" style={{ color: "#ffffff", margin: "0.2rem 0" }}>High Engagement & Academic Success</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--slate-300)" }}>Track student performance across enrolled courses and assignment submissions.</p>
          </div>
        </div>
      </section>

      {/* 4. Enrollment & Revenue Trends */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <section className="ui-card">
          <h2 className="h3" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={18} style={{ color: "var(--primary)" }} /> Enrollment Trends
          </h2>
          {enrollmentTrends?.trends?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {enrollmentTrends.trends.map((t, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                  <span>{t.date}</span>
                  <strong>{t.enrollments} enrollments</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-subtitle">No enrollment trend data available.</p>
          )}
        </section>

        <section className="ui-card">
          <h2 className="h3" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={18} style={{ color: "var(--success)" }} /> Revenue Trends
          </h2>
          {revenueTrends?.trends?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {revenueTrends.trends.map((r, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                  <span>{r.date}</span>
                  <strong>{formatCurrency(r.revenue)} ({r.orders} orders)</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-subtitle">No revenue trend data recorded.</p>
          )}
        </section>
      </div>

      {/* 5. Course Completion Rates Table */}
      <section className="ui-card">
        <h2 className="h3" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BarChart3 size={18} style={{ color: "var(--primary)" }} /> Course Completion Rates
        </h2>
        {completionData?.courses?.length ? (
          <DataTable columns={courseCompletionColumns} data={completionData.courses} keyField="course_id" />
        ) : (
          <p className="text-subtitle">No course completion data recorded yet.</p>
        )}
      </section>

      {/* 6. Student Activity Stream */}
      <section className="ui-card">
        <h2 className="h3" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Activity size={18} style={{ color: "var(--warning)" }} /> Recent Platform Student Activity
        </h2>
        {Array.isArray(studentActivity?.recent_enrollments) && studentActivity.recent_enrollments.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {studentActivity.recent_enrollments.slice(0, 5).map((act, i) => (
              <div key={act.id || i} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                Enrolled: <strong>{act.student__username || act.student_name || act.student?.username || "Student"}</strong> in {act.course__title || act.course_title || act.course?.title || "Course"}
                {act.created_at && (
                  <time dateTime={act.created_at} style={{ display: "block", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                    {new Date(act.created_at).toLocaleString()}
                  </time>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-subtitle">No recent student activity logs recorded.</p>
        )}
      </section>
    </div>
  );
}
