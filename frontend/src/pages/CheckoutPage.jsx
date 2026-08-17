import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listCart } from "../features/cart/cartService.js";
import { completeFreeCheckout, createCheckout } from "../features/checkout/checkoutService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatMoney(amount, currency = "USD") {
  return `${currency} ${Number(amount || 0).toFixed(2)}`;
}

export function CheckoutPage() {
  const { access } = useAuth();
  const [cart, setCart] = useState([]);
  const [courses, setCourses] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [status, setStatus] = useState("loading");
  const [actionStatus, setActionStatus] = useState("ready");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

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
        setMessage(error.message || "Unable to prepare checkout.");
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
  const isFree = checkout && total === 0;
  const hasItems = Number(checkout?.course_count || cart.length) > 0;

  async function handleFreeCheckout() {
    setActionStatus("loading");
    setMessage("");
    setResult(null);

    try {
      const data = await completeFreeCheckout(access);
      setResult(data);
    } catch (error) {
      setMessage(error.message || "Unable to complete free checkout.");
    } finally {
      setActionStatus("ready");
    }
  }

  if (status === "loading") {
    return <p className="page-message">Preparing checkout...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Checkout</h1>
          <p>
            {checkout?.course_count || cart.length} selected{" "}
            {(checkout?.course_count || cart.length) === 1 ? "course" : "courses"} / Total{" "}
            {formatMoney(total, currency)}
          </p>
        </div>
        <Link className="button-link" to="/cart">
          Back to cart
        </Link>
      </div>

      {message ? <p className={message.includes("ready") ? "form-success" : "form-error"}>{message}</p> : null}
      {result ? (
        <div className="form-success">
          <p>{result.message}. Order #{result.order_id} / {formatMoney(result.total_amount, result.currency)}</p>
          <Link to="/enrollment">Check enrolled courses</Link>
        </div>
      ) : null}

      {!hasItems ? <p className="page-message">Your cart is empty.</p> : null}

      {hasItems ? (
        <>
          <dl className="detail-list">
            <div>
              <dt>Backend total</dt>
              <dd>{formatMoney(total, currency)}</dd>
            </div>
            <div>
              <dt>Checkout type</dt>
              <dd>{isFree ? "Free" : "Paid"}</dd>
            </div>
            <div>
              <dt>Items</dt>
              <dd>{checkout?.course_count || cart.length}</dd>
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
                  <div className="course-card-footer">
                    <span>Included in checkout</span>
                    <Link to={`/courses/${item.course}`}>Details</Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="actions">
            {isFree ? (
              <button
                className="cart-button"
                disabled={actionStatus === "loading" || Boolean(result)}
                onClick={handleFreeCheckout}
                type="button"
              >
                Complete free checkout
              </button>
            ) : (
              <Link className="button-link" to="/payment">
                Continue to payment
              </Link>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
