import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listOrders } from "../features/orders/orderService.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatMoney(amount) {
  return `USD ${Number(amount || 0).toFixed(2)}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "Not available";
}

export function OrderListPage() {
  const { access } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    listOrders(access)
      .then((data) => {
        if (!active) return;
        setOrders(itemsFrom(data));
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load orders.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access]);

  if (status === "loading") {
    return <p className="page-message">Loading orders...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Orders</h1>
          <p>Your course purchases.</p>
        </div>
        <Link className="button-link" to="/courses">
          Browse courses
        </Link>
      </div>

      {orders.length === 0 ? <p className="page-message">No orders found.</p> : null}

      {orders.length ? (
        <div className="item-list">
          {orders.map((order) => (
            <article className="item-row" key={order.id}>
              <div>
                <h2>Order #{order.id}</h2>
                <p>
                  {formatMoney(order.total_amount)} / {order.items?.length || 0}{" "}
                  {(order.items?.length || 0) === 1 ? "course" : "courses"}
                </p>
                <small>
                  {order.status} / {formatDate(order.created_at)}
                </small>
              </div>
              <Link to={`/orders/${order.id}`}>Details</Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
