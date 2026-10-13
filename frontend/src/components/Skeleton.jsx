export function Skeleton({ width = "100%", height = "20px", borderRadius = "var(--radius-sm)", style = {} }) {
  return (
    <div
      className="skeleton-box"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="course-card-ui" style={{ height: "350px", pointerEvents: "none" }}>
      <Skeleton height="175px" borderRadius="0" />
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
        <Skeleton width="40%" height="14px" />
        <Skeleton width="85%" height="22px" />
        <Skeleton width="60%" height="14px" />
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton width="30%" height="24px" />
          <Skeleton width="35%" height="32px" borderRadius="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="table-wrapper" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Skeleton height="24px" width="100%" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height="40px" width="100%" />
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card-ui" style={{ pointerEvents: "none" }}>
      <Skeleton width="48px" height="48px" borderRadius="var(--radius-md)" />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
        <Skeleton width="50%" height="24px" />
        <Skeleton width="70%" height="14px" />
      </div>
    </div>
  );
}
