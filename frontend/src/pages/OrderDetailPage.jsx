import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  CreditCard,
  Package,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { ROLES } from "../features/auth/roles.js";
import { listOrders } from "../features/orders/orderService.js";
import { ErrorState } from "../components/ErrorState.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function OrderMeta({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", minWidth: 0 }}>
      <span style={{ display: "grid", placeItems: "center", width: "2.35rem", height: "2.35rem", flex: "0 0 auto", borderRadius: "var(--radius-md)", background: "var(--bg-subtle)", color: "var(--primary)" }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 600 }}>{label}</div>
        <div style={{ marginTop: "0.25rem", color: "var(--text-main)", fontSize: "0.9rem", fontWeight: 600, overflowWrap: "anywhere" }}>{value}</div>
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { access, role } = useAuth();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const isAdmin = role === ROLES.ADMIN;
  const backTo = location.pathname.startsWith("/admin/") ? "/admin/orders" : "/orders";

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    if (!access) {
      setMessage("Your session is not ready. Please sign in again.");
      setStatus("error");
      return undefined;
    }

    listOrders(access)
      .then((data) => {
        if (!active) return;
        const match = itemsFrom(data).find((item) => Number(item.id) === Number(id));
        if (!match) {
          setMessage("We couldn't find this order. It may have been removed or you may not have access to it.");
          setStatus("error");
          return;
        }
        setOrder(match);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load this order right now.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, id, reloadCount]);

  if (status === "loading") {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <Skeleton height="150px" />
        <Skeleton height="95px" />
        <Skeleton height="280px" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <Link to={backTo} className="btn btn-outline" style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <ErrorState title="Unable to show this order" message={message} onRetry={() => setReloadCount((count) => count + 1)} />
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <main style={{ display: "grid", gap: "1.25rem", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
      <Link to={backTo} className="btn btn-outline" style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <section
        className="ui-card"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "clamp(1.25rem, 4vw, 2rem)",
          background: "linear-gradient(120deg, var(--bg-surface) 0%, var(--primary-light) 100%)",
          border: "1px solid var(--primary-border)",
        }}
      >
        <div style={{ position: "absolute", right: "-2.5rem", top: "-3rem", width: "11rem", height: "11rem", borderRadius: "50%", background: "var(--primary)", opacity: 0.06 }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "var(--primary)", fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              <ReceiptText size={17} /> Order receipt
            </div>
            <h1 style={{ margin: "0.55rem 0 0.3rem", fontSize: "clamp(1.65rem, 4vw, 2.25rem)", lineHeight: 1.15, fontWeight: 800, color: "var(--text-main)" }}>
              Order #{order.id}
            </h1>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>Placed {formatDate(order.created_at)}</p>
          </div>
          <div style={{ display: "grid", justifyItems: "end", gap: "0.65rem" }}>
            <StatusBadge status={order.status || "unknown"} size="lg" />
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <ShieldCheck size={15} /> Order information
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Order information" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))", gap: "1rem" }}>
        <article className="ui-card" style={{ padding: "1rem" }}>
          <OrderMeta icon={<CalendarDays size={18} />} label="Order date" value={formatDate(order.created_at)} />
        </article>
        <article className="ui-card" style={{ padding: "1rem" }}>
          <OrderMeta icon={<Package size={18} />} label="Items purchased" value={`${items.length} ${items.length === 1 ? "course" : "courses"}`} />
        </article>
        <article className="ui-card" style={{ padding: "1rem" }}>
          <OrderMeta icon={<Clock3 size={18} />} label="Last updated" value={formatDate(order.updated_at)} />
        </article>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1.25rem", alignItems: "start" }}>
        <section className="ui-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.1rem 1.25rem", borderBottom: "1px solid var(--border-color)" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-main)" }}>Purchased courses</h2>
            <p style={{ margin: "0.3rem 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {items.length ? "Your course items included in this order." : "No course items were recorded for this order."}
            </p>
          </div>

          {items.length ? (
            <div>
              {items.map((item, index) => (
                <article
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.15rem 1.25rem",
                    borderBottom: index < items.length - 1 ? "1px solid var(--border-color)" : "none",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", minWidth: 0 }}>
                    <span style={{ display: "grid", placeItems: "center", flex: "0 0 auto", width: "2.75rem", height: "2.75rem", borderRadius: "var(--radius-md)", background: "var(--primary-light)", color: "var(--primary)" }}>
                      <BookOpen size={20} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Course #{item.course}</div>
                      <h3 style={{ margin: 0, fontSize: "1rem", lineHeight: 1.4, overflowWrap: "anywhere" }}>{item.course_title || `Course #${item.course}`}</h3>
                      <div style={{ marginTop: "0.3rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        Purchased {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "3.6rem" }}>
                    <strong style={{ whiteSpace: "nowrap", color: "var(--text-main)" }}>{formatCurrency(item.price)}</strong>
                    <Link to={`/courses/${item.course}`} className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", whiteSpace: "nowrap" }}>
                      Course details <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ padding: "2rem 1.25rem", color: "var(--text-muted)", textAlign: "center" }}>No items to display.</div>
          )}
        </section>

        <aside style={{ display: "grid", gap: "1rem" }}>
          <section className="ui-card" style={{ padding: "1.2rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>Payment summary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <span>Courses ({items.length})</span>
              <span>{formatCurrency(items.reduce((sum, item) => sum + Number(item.price || 0), 0))}</span>
            </div>
            <div style={{ height: "1px", background: "var(--border-color)", margin: "0.9rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.75rem" }}>
              <strong style={{ fontSize: "0.95rem" }}>Order total</strong>
              <strong style={{ color: "var(--primary)", fontSize: "1.25rem" }}>{formatCurrency(order.total_amount)}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginTop: "0.85rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
              <CreditCard size={15} /> Payment status: <StatusBadge status={order.status || "unknown"} size="sm" withDot={false} />
            </div>
          </section>

          {isAdmin && (
            <section className="ui-card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                <UserRound size={18} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Customer</h2>
              </div>
              <div style={{ fontWeight: 700 }}>{order.student_name || `Student #${order.student}`}</div>
              {order.student_email && <div style={{ marginTop: "0.3rem", fontSize: "0.85rem", color: "var(--text-muted)", overflowWrap: "anywhere" }}>{order.student_email}</div>}
            </section>
          )}

          <Link to="/courses" className="btn btn-primary" style={{ justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            Explore courses <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
