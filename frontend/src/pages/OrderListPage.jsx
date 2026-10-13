import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listOrders } from "../features/orders/orderService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { DataTable } from "../components/DataTable.jsx";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

export function OrderListPage() {
  const { access } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!access) return;
    setLoading(true);

    listOrders(access)
      .then((data) => {
        setOrders(itemsFrom(data));
      })
      .catch((err) => {
        setError(err.message || "Unable to load orders.");
      })
      .finally(() => setLoading(false));
  }, [access]);

  const columns = [
    {
      header: "Order ID",
      accessor: "id",
      cell: (row) => <strong>#{row.id}</strong>,
    },
    {
      header: "Date",
      accessor: "created_at",
      cell: (row) => new Date(row.created_at || Date.now()).toLocaleDateString(),
    },
    {
      header: "Total Amount",
      accessor: "total_amount",
      cell: (row) => <strong style={{ color: "var(--primary)" }}>${Number(row.total_amount || 0).toFixed(2)}</strong>,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      cell: (row) => (
        <Link to={`/orders/${row.id}`} className="btn btn-outline" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem" }}>
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Order History</h1>
          <p style={{ color: "var(--text-muted)" }}>View all your past course purchases and transactions.</p>
        </div>
        <Link className="btn btn-primary" to="/courses">
          Explore Courses
        </Link>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="You have not purchased any paid courses yet."
          actionText="Browse Courses"
          actionLink="/courses"
          icon="📦"
        />
      ) : (
        <DataTable columns={columns} data={orders} keyField="id" />
      )}
    </div>
  );
}
