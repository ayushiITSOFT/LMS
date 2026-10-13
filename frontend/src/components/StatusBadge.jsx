export function StatusBadge({ status, label: customLabel, withDot = true, size = "md" }) {
  if (!status && !customLabel) return null;

  const rawStatus = String(status || customLabel).toLowerCase();
  let variant = "badge-neutral";
  let displayLabel = customLabel || status;

  if (["published", "paid", "completed", "graded", "success", "active", "passed"].includes(rawStatus)) {
    variant = "badge-success";
  } else if (["pending", "draft", "in_progress", "submitted", "reviewing"].includes(rawStatus)) {
    variant = "badge-warning";
  } else if (["failed", "cancelled", "rejected", "deleted", "unpaid"].includes(rawStatus)) {
    variant = "badge-danger";
  } else if (["info", "processing", "enrolled"].includes(rawStatus)) {
    variant = "badge-info";
  } else if (["admin", "instructor", "master"].includes(rawStatus)) {
    variant = "badge-purple";
  }

  // Format label: replace underscores with spaces and capitalize
  if (typeof displayLabel === "string") {
    displayLabel = displayLabel.replace(/_/g, " ");
  }

  return (
    <span className={`badge-ui ${variant} badge-${size}`}>
      {withDot && <span className="badge-dot" />}
      <span>{displayLabel}</span>
    </span>
  );
}
