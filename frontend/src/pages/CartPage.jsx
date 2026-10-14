import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listCart, removeFromCart } from "../features/cart/cartService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function priceOf(course) {
  return Number(course?.price || 0);
}

function formatPrice(price) {
  const amount = Number(price || 0);
  return amount > 0 ? `$${amount.toFixed(2)}` : "Free";
}

export function CartPage() {
  const { access } = useAuth();
  const [cart, setCart] = useState([]);
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    Promise.all([listCart(access), listPublishedCourses({ page_size: 100 })])
      .then(([cartData, courseData]) => {
        if (!active) return;
        setCart(cartData);
        setCourses(itemsFrom(courseData));
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load cart.");
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

  const total = cart.reduce(
    (sum, item) => sum + priceOf(courseById.get(Number(item.course))),
    0
  );

  async function handleRemove(courseId) {
    setRemovingId(courseId);
    setMessage("");

    try {
      await removeFromCart(courseId, access);
      setCart((current) => current.filter((item) => Number(item.course) !== Number(courseId)));
    } catch (error) {
      setMessage(error.message || "Unable to remove cart item.");
    } finally {
      setRemovingId(null);
    }
  }

  if (status === "loading") {
    return <Skeleton height="300px" />;
  }

  if (status === "error") {
    return <ErrorState message={message} onRetry={() => window.location.reload()} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Shopping Cart</h1>
          <p style={{ color: "var(--text-muted)" }}>
            {cart.length} {cart.length === 1 ? "course" : "courses"} in your cart
          </p>
        </div>
        <Link className="btn btn-outline" to="/courses">
          Continue Shopping
        </Link>
      </div>

      {message && <div style={{ color: "var(--danger)", fontWeight: 600 }}>{message}</div>}

      {cart.length === 0 ? (
        <EmptyState
          title="Your shopping cart is empty"
          description="Explore our course directory to add new skills to your cart."
          actionText="Browse Courses"
          actionLink="/courses"
          icon="🛒"
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
          {/* Cart Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {cart.map((item) => {
              const course = courseById.get(Number(item.course));

              return (
                <div className="card" key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  <div>
                    <span className="course-category">{course?.category || "Course"}</span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{course?.title || `Course #${item.course}`}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Added {new Date(item.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary)" }}>
                      {course ? formatPrice(course.price) : "Free"}
                    </div>
                    <button
                      type="button"
                      disabled={removingId === item.course}
                      onClick={() => handleRemove(item.course)}
                      className="btn btn-danger"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Order Summary Card */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", alignSelf: "start" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Order Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "800" }}>
              <span>Total</span>
              <span style={{ color: "var(--primary)" }}>{formatPrice(total)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem" }}>
              Proceed to Checkout →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
