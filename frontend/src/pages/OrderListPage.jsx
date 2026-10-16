import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, DollarSign, PackageCheck, ShoppingBag } from "lucide-react";
import { useAuth } from "../features/auth/useAuth.js";
import { ROLES } from "../features/auth/roles.js";
import { listOrders } from "../features/orders/orderService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
}

export function OrderListPage() {
  const { access, role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reloadCount, setReloadCount] = useState(0);
  const isAdmin = role === ROLES.ADMIN;

  useEffect(() => {
    if (!access) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError(null);

    listOrders(access)
      .then((data) => {
        if (active) setOrders(itemsFrom(data));
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [access, reloadCount]);

  const statuses = useMemo(
    () => [...new Set(orders.map((order) => String(order.status || "").toLowerCase()).filter(Boolean))].sort(),
    [orders]
  );
  const visibleOrders = useMemo(
    () => statusFilter === "all"
      ? orders
      : orders.filter((order) => String(order.status || "").toLowerCase() === statusFilter),
    [orders, statusFilter]
  );
  const paidOrders = orders.filter((order) => ["paid", "completed"].includes(String(order.status || "").toLowerCase()));
  const totalValue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const paidValue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const pendingCount = orders.filter((order) => ["pending", "processing"].includes(String(order.status || "").toLowerCase())).length;

  const columns = [
    {
      header: "Order ID",
      accessor: "id",
      cell: (row) => (
        <div>
          <strong style={{ color: "var(--text-main)" }}>#{row.id}</strong>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Course purchase</div>
        </div>
      ),
    },
    ...(isAdmin ? [{
      header: "Customer",
      key: "student_name",
      accessor: (row) => `${row.student_name || ""} ${row.student_email || ""}`,
      cell: (row) => (
        <div>
          <strong>{row.student_name || `Student #${row.student}`}</strong>
          {row.student_email && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{row.student_email}</div>}
        </div>
      ),
    }] : []),
    {
      header: "Items",
      accessor: (row) => row.items?.length || 0,
      cell: (row) => `${row.items?.length || 0} ${(row.items?.length || 0) === 1 ? "course" : "courses"}`,
    },
    {
      header: "Date",
      accessor: "created_at",
      cell: (row) => formatDate(row.created_at),
    },
    {
      header: "Total",
      accessor: "total_amount",
      cell: (row) => <strong style={{ color: "var(--text-main)" }}>{formatCurrency(row.total_amount)}</strong>,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status || "unknown"} />,
    },
    {
      header: "Action",
      cell: (row) => (
        <Link to={`/orders/${row.id}`} className="btn btn-outline" style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
          View order <ArrowUpRight size={15} />
        </Link>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
            <span style={{ display: "grid", placeItems: "center", width: "2.5rem", height: "2.5rem", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-md)" }}>
              <ShoppingBag size={20} />
            </span>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: 0 }}>Order History</h1>
          </div>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            {isAdmin ? "Review purchases and transactions across the platform." : "Track your course purchases and payment status."}
          </p>
        </div>
        <Link className="btn btn-primary" to="/courses" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          Browse courses <ArrowUpRight size={16} />
        </Link>
      </header>

      {loading ? <Skeleton height="300px" /> : error ? <ErrorState message={error} onRetry={() => setReloadCount((count) => count + 1)} /> : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={isAdmin ? "There are no course orders to display yet." : "You have not purchased any courses yet."}
          actionText="Browse courses"
          actionLink="/courses"
          icon="📦"
        />
      ) : (
        <>
          <section aria-label="Order summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Total orders", value: orders.length, icon: <ShoppingBag size={19} />, tint: "var(--primary-light)", color: "var(--primary)" },
              { label: isAdmin ? "Paid revenue" : "Paid orders", value: isAdmin ? formatCurrency(paidValue) : paidOrders.length, icon: <DollarSign size={19} />, tint: "var(--success-light)", color: "var(--success)" },
              { label: "Awaiting payment", value: pendingCount, icon: <Clock3 size={19} />, tint: "var(--warning-light)", color: "var(--warning-hover)" },
              { label: isAdmin ? "Order value" : "Total order value", value: formatCurrency(totalValue), icon: <PackageCheck size={19} />, tint: "var(--purple-light)", color: "var(--purple)" },
            ].map((item) => (
              <article key={item.label} className="ui-card" style={{ padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <span style={{ display: "grid", placeItems: "center", flex: "0 0 auto", width: "2.6rem", height: "2.6rem", borderRadius: "var(--radius-md)", background: item.tint, color: item.color }}>
                  {item.icon}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>{item.label}</div>
                  <strong style={{ display: "block", marginTop: "0.15rem", fontSize: "1.1rem", overflowWrap: "anywhere" }}>{item.value}</strong>
                </div>
              </article>
            ))}
          </section>

          <section className="ui-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.15rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>All orders</h2>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {visibleOrders.length} {visibleOrders.length === 1 ? "order" : "orders"} shown
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
                Filter status
                <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ width: "auto", minWidth: "145px" }}>
                  <option value="all">All statuses</option>
                  {statuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, " ")}</option>)}
                </select>
              </label>
            </div>
            <DataTable
              columns={columns}
              data={visibleOrders}
              keyField="id"
              searchPlaceholder={isAdmin ? "Search orders or customers..." : "Search your orders..."}
              emptyText="No orders match this status."
            />
          </section>
        </>
      )}
    </div>
  );
}
