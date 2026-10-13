export function Tabs({ tabs, activeTab, onChange }) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="tabs-ui">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`tab-item ${isActive ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && <span className="tab-badge">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
