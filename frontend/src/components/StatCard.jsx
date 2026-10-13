import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({ title, value, label, icon: Icon, variant = "primary", helperText, trend, trendType = "up" }) {
  return (
    <div className="stat-card-ui">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
        <div className="stat-lbl">{title || label}</div>
        <div className="stat-val">{value ?? 0}</div>

        {(trend || helperText) && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
            {trend && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.15rem",
                  fontSize: "0.725rem",
                  fontWeight: 700,
                  color: trendType === "up" ? "var(--success)" : "var(--danger)",
                  background: trendType === "up" ? "var(--success-light)" : "var(--danger-light)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {trendType === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend}
              </span>
            )}
            {helperText && (
              <span className="stat-helper">{helperText}</span>
            )}
          </div>
        )}
      </div>

      {Icon && (
        <div className={`stat-icon-wrapper ${variant}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

