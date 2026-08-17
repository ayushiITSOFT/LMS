import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listCart } from "../features/cart/cartService.js";
import { createCheckout, processPayment } from "../features/checkout/checkoutService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatMoney(amount, currency = "USD") {
  return `${currency} ${Number(amount || 0).toFixed(2)}`;
}

export function PaymentPage() {
  const { access } = useAuth();
  const [cart, setCart] = useState([]);
  const [courses, setCourses] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState("loading");
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    Promise.all([listCart(access), listPublishedCourses({ page_size: 100 }), createCheckout(access)])
      .then(([cartData, courseData, checkoutData]) => {
        if (!active) return;
        setCart(itemsFrom(cartData));
        setCourses(itemsFrom(courseData));
        setCheckout(checkoutData);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to prepare payment.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access]);

  const courseById = useMemo(
    () => new Map(courses.map((course) => [Number(course.id), course])),
    [courses]
  );
  const total = Number(checkout?.total_amount || 0);
  const currency = checkout?.currency || "USD";
  const hasItems = Number(checkout?.course_count || cart.length) > 0;
  const isFree = checkout && total === 0;

  async function handlePayment() {
    setPaymentStatus("loading");
    setPayment(null);
    setMessage("");

    try {
      const data = await processPayment(access);
      setPayment(data);
      setPaymentStatus("success");
    } catch (error) {
      setMessage(error.message || "Payment failed.");
      setPaymentStatus("failed");
    }
  }

  if (status === "loading") {
    return <p className="page-message">Preparing payment...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Payment</h1>
          <p>
            {checkout?.course_count || cart.length}{" "}
            {(checkout?.course_count || cart.length) === 1 ? "course" : "courses"} / Total{" "}
            {formatMoney(total, currency)}
          </p>
        </div>
        <Link className="button-link" to="/checkout">
          Back to checkout
        </Link>
      </div>

      {message ? <p className="form-error">{message}</p> : null}
      {paymentStatus === "success" && payment ? (
        <div className="builder-panel">
          <h2>{payment.message}</h2>
          <dl className="detail-list">
            <div>
              <dt>Order</dt>
              <dd>#{payment.order_id}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{payment.payment_id ? `#${payment.payment_id}` : "Not required"}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatMoney(payment.total_amount, payment.currency)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{payment.payment_status || payment.status}</dd>
            </div>
          </dl>
          <Link className="button-link" to="/enrollment">Check enrolled courses</Link>
        </div>
      ) : null}

      {!hasItems ? <p className="page-message">Your cart is empty.</p> : null}

      {hasItems && paymentStatus !== "success" ? (
        <>
          <dl className="detail-list">
            <div>
              <dt>Backend total</dt>
              <dd>{formatMoney(total, currency)}</dd>
            </div>
            <div>
              <dt>Payment flow</dt>
              <dd>{isFree ? "Free order" : "Backend payment processor"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{paymentStatus === "failed" ? "Failed" : "Ready"}</dd>
            </div>
          </dl>

          <div className="course-grid">
            {cart.map((item) => {
              const course = courseById.get(Number(item.course));

              return (
                <article className="course-card" key={item.id}>
                  <div>
                    <small>{course?.category || `Course #${item.course}`}</small>
                    <h2>{course?.title || "Selected course"}</h2>
                    <p>{course?.subtitle || course?.description || "Course details require access."}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="actions">
            <button
              className="cart-button"
              disabled={paymentStatus === "loading"}
              onClick={handlePayment}
              type="button"
            >
              {paymentStatus === "loading"
                ? "Processing..."
                : paymentStatus === "failed"
                  ? "Retry payment"
                  : isFree
                    ? "Complete free order"
                    : "Pay now"}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
