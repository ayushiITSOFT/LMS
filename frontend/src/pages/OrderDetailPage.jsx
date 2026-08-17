import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listOrders } from "../features/orders/orderService.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatMoney(amount) {
  return `USD ${Number(amount || 0).toFixed(2)}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { access } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    listOrders(access)
      .then((data) => {
        if (!active) return;
        const match = itemsFrom(data).find((item) => Number(item.id) === Number(id));
        if (!match) {
          setMessage("Order not found.");
          setStatus("error");
          return;
        }
        setOrder(match);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load order.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, id]);

  if (status === "loading") {
    return <p className="page-message">Loading order...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Order #{order.id}</h1>
          <p>{formatDate(order.created_at)}</p>
        </div>
        <Link className="button-link" to="/orders">
          Back to orders
        </Link>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Status</dt>
          <dd>{order.status}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatMoney(order.total_amount)}</dd>
        </div>
        <div>
          <dt>Items</dt>
          <dd>{order.items?.length || 0}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDate(order.updated_at)}</dd>
        </div>
      </dl>

      {order.items?.length ? (
        <div className="course-grid">
          {order.items.map((item) => (
            <article className="course-card" key={item.id}>
              <div>
                <small>Course #{item.course}</small>
                <h2>{item.course_title}</h2>
                <p>{formatMoney(item.price)}</p>
              </div>
              <div className="course-card-footer">
                <span>Ordered {formatDate(item.created_at)}</span>
                <Link to={`/courses/${item.course}`}>Details</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="page-message">No order items found.</p>
      )}
    </section>
  );
}
