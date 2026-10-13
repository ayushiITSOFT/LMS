import { Inbox } from "lucide-react";

export function EmptyState({ icon: CustomIcon, title = "No items found", description, action }) {
  return (
    <div className="empty-box">
      <div className="empty-box-icon">
        {typeof CustomIcon === "string" ? (
          <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{CustomIcon}</span>
        ) : CustomIcon ? (
          <CustomIcon size={28} />
        ) : (
          <Inbox size={28} />
        )}
      </div>
      <h3 className="h3" style={{ fontSize: "1.15rem" }}>{title}</h3>
      {description && <p className="text-subtitle" style={{ maxWidth: "420px" }}>{description}</p>}
      {action && <div style={{ marginTop: "0.5rem" }}>{action}</div>}
    </div>
  );
}
