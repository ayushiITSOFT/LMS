import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  UserCheck,
  Shield,
  GraduationCap,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowLeft,
  UserPlus,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { deleteAdminUser, listAdminUsers, updateAdminUser } from "../features/admin/adminService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataTable } from "../components/DataTable.jsx";

export function AdminUserListPage() {
  const { access, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionMessage, setActionMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!access) return;
    fetchUsers();
  }, [access, roleFilter]);

  function fetchUsers() {
    setLoading(true);
    setError(null);
    const params = {};
    if (roleFilter !== "all") params.role = roleFilter;
    if (search.trim()) params.search = search.trim();

    listAdminUsers(params, access)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setUsers(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load platform users.");
      })
      .finally(() => setLoading(false));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchUsers();
  }

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId);
    setActionMessage("");
    try {
      const updated = await updateAdminUser(userId, { role: newRole }, access);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      setActionMessage(`Role for user updated to "${newRole}" successfully.`);
    } catch (err) {
      alert(err.message || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleActive(userId, currentStatus) {
    setUpdatingId(userId);
    setActionMessage("");
    try {
      const updated = await updateAdminUser(userId, { is_active: !currentStatus }, access);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: updated.is_active } : u)));
      setActionMessage(`Account status changed to ${updated.is_active ? "Active" : "Disabled"}.`);
    } catch (err) {
      alert(err.message || "Failed to update account status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteUser(userId, username) {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This permanently removes their account and enrollments.`)) return;
    setUpdatingId(userId);
    setActionMessage("");
    try {
      await deleteAdminUser(userId, access);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setActionMessage(`User "${username}" was deleted successfully.`);
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setUpdatingId(null);
    }
  }

  const columns = [
    {
      header: "User Identity",
      accessor: "username",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.12)",
              color: "var(--primary, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.95rem",
              flexShrink: 0,
            }}
          >
            {(row.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <strong style={{ fontSize: "0.925rem", color: "var(--text-main, #0f172a)" }}>
                {row.username}
              </strong>
              {row.id === currentUser?.id && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "4px",
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "var(--primary, #6366f1)",
                  }}
                >
                  Current You
                </span>
              )}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>
              {row.email || "No email on record"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Platform Role",
      accessor: "role",
      cell: (row) => (
        <select
          value={row.role || "student"}
          disabled={updatingId === row.id || row.id === currentUser?.id}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          className="form-input"
          style={{
            fontSize: "0.825rem",
            padding: "0.3rem 0.6rem",
            fontWeight: 600,
            width: "auto",
            borderRadius: "6px",
            borderColor: "var(--border-color, #cbd5e1)",
            background: "var(--bg-surface, #ffffff)",
            cursor: row.id === currentUser?.id ? "not-allowed" : "pointer",
          }}
          title={row.id === currentUser?.id ? "You cannot modify your own administrator role" : "Change user role"}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Administrator</option>
        </select>
      ),
    },
    {
      header: "Account Status",
      accessor: "is_active",
      cell: (row) => {
        const isActive = row.is_active !== false;
        return (
          <button
            type="button"
            disabled={updatingId === row.id || row.id === currentUser?.id}
            onClick={() => handleToggleActive(row.id, isActive)}
            className="btn btn-sm"
            style={{
              padding: "0.25rem 0.65rem",
              fontSize: "0.775rem",
              fontWeight: 700,
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              background: isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: isActive ? "#059669" : "#dc2626",
              border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              cursor: row.id === currentUser?.id ? "not-allowed" : "pointer",
            }}
            title={row.id === currentUser?.id ? "You cannot deactivate your own account" : `Click to ${isActive ? "disable" : "activate"} user`}
          >
            {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            <span>{isActive ? "Active" : "Disabled"}</span>
          </button>
        );
      },
    },
    {
      header: "Joined Date",
      accessor: "date_joined",
      cell: (row) => (
        <span style={{ fontSize: "0.825rem", color: "var(--text-muted, #64748b)" }}>
          {row.date_joined ? new Date(row.date_joined).toLocaleDateString() : "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {row.id !== currentUser?.id ? (
            <button
              type="button"
              disabled={updatingId === row.id}
              onClick={() => handleDeleteUser(row.id, row.username)}
              className="btn btn-danger btn-sm"
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.775rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
              title="Delete account"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          ) : (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)", fontStyle: "italic" }}>
              Active Admin
            </span>
          )}
        </div>
      ),
    },
  ];

  const studentCount = users.filter((u) => u.role === "student").length;
  const instructorCount = users.filter((u) => u.role === "instructor").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Header with Breadcrumb & Quick Metrics */}
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            User Accounts & Governance
          </h1>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.925rem", margin: "0.25rem 0 0 0" }}>
            Manage platform members, assign instructor/admin privileges, and regulate login access.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchUsers}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md, 10px)",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#059669",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            fontWeight: 600,
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 2. Search & Role Filter Tabs */}
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1.25rem",
          borderRadius: "var(--radius-lg, 14px)",
          border: "1px solid var(--border-color, #e2e8f0)",
          background: "var(--bg-surface, #ffffff)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {/* Role Filter Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`btn btn-sm ${roleFilter === "all" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontWeight: 600 }}
            >
              All Users ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("student")}
              className={`btn btn-sm ${roleFilter === "student" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontWeight: 600 }}
            >
              Students ({studentCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("instructor")}
              className={`btn btn-sm ${roleFilter === "instructor" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontWeight: 600 }}
            >
              Instructors ({instructorCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("admin")}
              className={`btn btn-sm ${roleFilter === "admin" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontWeight: 600 }}
            >
              Admins ({adminCount})
            </button>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", maxWidth: "340px", width: "100%" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                className="form-input"
                placeholder="Search by username or email..."
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
            <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: "0.4rem 0.8rem" }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 3. Data Table */}
      {loading ? (
        <Skeleton height="350px" borderRadius="12px" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description={search ? `No user records matching "${search}".` : "No platform user accounts registered under this filter."}
          icon="👥"
        />
      ) : (
        <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "var(--radius-lg, 14px)", border: "1px solid var(--border-color, #e2e8f0)", overflow: "hidden" }}>
          <DataTable columns={columns} data={users} keyField="id" />
        </div>
      )}
    </div>
  );
}
