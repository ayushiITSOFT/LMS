import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { listAuditLogs } from "../features/audit_logs/auditLogService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataTable } from "../components/DataTable.jsx";

export function AuditLogsPage() {
  const { access } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  function fetchLogs() {
    if (!access) return;
    setLoading(true);
    setError(null);

    listAuditLogs(access)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setLogs(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load audit logs.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchLogs();
  }, [access]);

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const user = (log.user_name || log.user?.username || (typeof log.user === "string" ? log.user : "")).toLowerCase();
    const action = (log.action || "").toLowerCase();
    const target = (log.object_repr || log.object || log.resource || "").toLowerCase();
    return user.includes(q) || action.includes(q) || target.includes(q);
  });

  const columns = [
    {
      header: "Administrator / User",
      accessor: "user_name",
      cell: (row) => {
        const name = row.user_name || row.user?.username || (typeof row.user === "string" ? row.user : `User #${row.user}`) || "System";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.12)",
                color: "var(--primary, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {(name || "A")[0].toUpperCase()}
            </div>
            <strong style={{ fontSize: "0.875rem", color: "var(--text-main, #0f172a)" }}>{name}</strong>
          </div>
        );
      },
    },
    {
      header: "Action Performed",
      accessor: "action",
      cell: (row) => {
        const act = (row.action || "ACTION").toUpperCase();
        const isDelete = act.includes("DELETE") || act.includes("REMOVE");
        const isCreate = act.includes("CREATE") || act.includes("ADD");

        return (
          <span
            style={{
              display: "inline-block",
              padding: "0.2rem 0.55rem",
              borderRadius: "4px",
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "monospace",
              background: isDelete ? "rgba(239, 68, 68, 0.1)" : isCreate ? "rgba(16, 185, 129, 0.1)" : "rgba(2, 132, 199, 0.1)",
              color: isDelete ? "#dc2626" : isCreate ? "#059669" : "#0284c7",
              border: `1px solid ${isDelete ? "rgba(239, 68, 68, 0.25)" : isCreate ? "rgba(16, 185, 129, 0.25)" : "rgba(2, 132, 199, 0.25)"}`,
            }}
          >
            {row.action}
          </span>
        );
      },
    },
    {
      header: "Target Resource",
      accessor: "object_repr",
      cell: (row) => (
        <span style={{ fontSize: "0.85rem", color: "var(--text-main, #0f172a)", fontWeight: 500 }}>
          {row.object_repr || row.object || row.resource || "-"}
        </span>
      ),
    },
    {
      header: "Timestamp",
      accessor: "timestamp",
      cell: (row) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>
          {new Date(row.timestamp || row.created_at || Date.now()).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Header with Breadcrumb & Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          background: "var(--bg-surface, #ffffff)",
          padding: "1.5rem 1.75rem",
          borderRadius: "var(--radius-lg, 16px)",
          border: "1px solid var(--border-color, #e2e8f0)",
        }}
      >
        <div>
          <Link to="/admin" className="btn btn-secondary btn-sm" style={{ marginBottom: "0.6rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <ArrowLeft size={14} />
            <span>Admin Dashboard</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              Security Audit Logs
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.2rem 0.55rem",
                borderRadius: "999px",
                background: "rgba(16, 185, 129, 0.1)",
                color: "#059669",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <ShieldCheck size={12} />
              Immutable Trail
            </span>
          </div>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.925rem", margin: "0.25rem 0 0 0" }}>
            Real-time administrative action trail tracking configuration modifications, access events, and data changes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Search Bar */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1rem 1.25rem",
          borderRadius: "var(--radius-lg, 14px)",
          border: "1px solid var(--border-color, #e2e8f0)",
          background: "var(--bg-surface, #ffffff)",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>
          Logged Records: <strong>{filteredLogs.length}</strong>
        </div>

        <div style={{ position: "relative", maxWidth: "340px", width: "100%" }}>
          <input
            className="form-input"
            placeholder="Search by user, action, or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem", margin: 0, fontSize: "0.85rem", width: "100%" }}
          />
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--slate-400, #94a3b8)",
            }}
          />
        </div>
      </div>

      {/* 3. Data Table */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="No Audit Records Found"
          description={search ? `No activity matching "${search}".` : "No system security events logged yet."}
          icon="🛡️"
        />
      ) : (
        <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "var(--radius-lg, 14px)", border: "1px solid var(--border-color, #e2e8f0)", overflow: "hidden" }}>
          <DataTable columns={columns} data={filteredLogs} keyField="id" />
        </div>
      )}
    </div>
  );
}
