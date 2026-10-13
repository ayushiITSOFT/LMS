import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth.js";
import { listPublishedCourses } from "../features/courses/courseService.js";
import {
  createCourseAnnouncement,
  deleteCourseAnnouncement,
  listCourseAnnouncements,
  pinCourseAnnouncement,
} from "../features/announcements/announcementService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

export function AnnouncementsPage() {
  const { access, role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listPublishedCourses({ page_size: 50 }, access)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setCourses(items);
        if (items.length > 0) {
          setSelectedCourseId(items[0].id);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [access]);

  useEffect(() => {
    if (!selectedCourseId || !access) return;

    setLoading(true);
    listCourseAnnouncements(selectedCourseId, access)
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setAnnouncements(items);
      })
      .catch((err) => {
        setError(err.message || "Failed to load announcements.");
      })
      .finally(() => setLoading(false));
  }, [access, selectedCourseId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!selectedCourseId) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createCourseAnnouncement(selectedCourseId, { title, message: content }, access);
      setAnnouncements((prev) => [created, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.message || "Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePin(id) {
    try {
      await pinCourseAnnouncement(selectedCourseId, id, access);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_pinned: !a.is_pinned } : a))
      );
    } catch {
      // Handle error
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteCourseAnnouncement(selectedCourseId, id, access);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete announcement.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Course Announcements</h1>
        <p style={{ color: "var(--text-muted)" }}>Broadcast news and updates to enrolled course students.</p>
      </div>

      {courses.length > 0 && (
        <div className="form-group" style={{ maxWidth: "400px" }}>
          <label className="form-label">Select Course</label>
          <select
            className="select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {role === "instructor" && selectedCourseId && (
        <form onSubmit={handleCreate} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>📢 Post New Announcement</h3>
          {error && <div style={{ color: "var(--danger)" }}>{error}</div>}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Content</label>
            <textarea className="textarea" rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement details..." required />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
            {submitting ? "Posting..." : "Post Announcement"}
          </button>
        </form>
      )}

      {loading ? (
        <Skeleton height="200px" />
      ) : announcements.length === 0 ? (
        <EmptyState title="No announcements" description="There are no announcements posted for this course yet." icon="📢" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {announcements.map((a) => (
            <div key={a.id} className="card" style={{ borderLeft: a.is_pinned ? "4px solid var(--primary)" : "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>
                  {a.is_pinned && "📌 "}
                  {a.title}
                </h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {role === "instructor" && (
                    <>
                      <button type="button" onClick={() => handlePin(a.id)} className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                        {a.is_pinned ? "Unpin" : "Pin"}
                      </button>
                      <button type="button" onClick={() => handleDelete(a.id)} className="btn btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>{a.message || a.content}</p>
              <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-light)" }}>
                Posted on {new Date(a.created_at || Date.now()).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
