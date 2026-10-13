import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../features/notifications/notificationService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

export function NotificationsPage() {
  const { access } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!access) return;
    setLoading(true);
    setError(null);

    listNotifications(access)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setNotifications(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load notifications.");
      })
      .finally(() => setLoading(false));
  }, [access]);

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id, access);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Handle silently
    }
  }

  async function handleMarkAllRead() {
    setActionLoading(true);
    try {
      await markAllNotificationsRead(access);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.message || "Failed to mark all as read.");
    } finally {
      setActionLoading(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Notification Center</h1>
          <p style={{ color: "var(--text-muted)" }}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All notifications read"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={actionLoading}
            className="btn btn-outline"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton height="250px" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Updates about your courses, assignments, and orders will appear here."
          icon="🔔"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                background: n.read ? "var(--bg-surface)" : "var(--primary-light)",
                borderColor: n.read ? "var(--border-color)" : "var(--primary-border)",
              }}
            >
              <div>
                <div style={{ fontWeight: n.read ? 600 : 800, fontSize: "1rem", marginBottom: "0.25rem" }}>
                  {n.verb || n.message || "Notification"}
                </div>
                {n.description && <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{n.description}</p>}
                <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                  {new Date(n.created_at || Date.now()).toLocaleString()}
                </span>
              </div>

              {!n.read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
