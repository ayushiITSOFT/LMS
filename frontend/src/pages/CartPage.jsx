import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";
import { listCart, removeFromCart } from "../features/cart/cartService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";

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
        setCart(itemsFrom(cartData));
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
    return <p className="page-message">Loading cart...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Cart</h1>
          <p>
            {cart.length} {cart.length === 1 ? "course" : "courses"} / Total{" "}
            {formatPrice(total)}
          </p>
        </div>
        <Link className="button-link" to="/courses">
          Browse courses
        </Link>
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      {cart.length === 0 ? <p className="page-message">Your cart is empty.</p> : null}
      {cart.length ? (
        <div className="course-grid">
          {cart.map((item) => {
            const course = courseById.get(Number(item.course));

            return (
              <article className="course-card" key={item.id}>
                <div>
                  <small>{course?.category || `Course #${item.course}`}</small>
                  <h2>{course?.title || "Cart course"}</h2>
                  <p>{course?.subtitle || course?.description || "Course details require access."}</p>
                </div>
                <dl className="detail-list">
                  <div>
                    <dt>Price</dt>
                    <dd>{course ? formatPrice(course.price) : "Unavailable"}</dd>
                  </div>
                  <div>
                    <dt>Level</dt>
                    <dd>{course?.level || "Not set"}</dd>
                  </div>
                  <div>
                    <dt>Added</dt>
                    <dd>{new Date(item.created_at).toLocaleDateString()}</dd>
                  </div>
                </dl>
                <div className="course-card-footer">
                  <span>{course ? "Ready in cart" : "Saved cart item"}</span>
                  <div className="actions">
                    <button
                      className="danger-button"
                      disabled={removingId === item.course}
                      onClick={() => handleRemove(item.course)}
                      type="button"
                    >
                      Remove
                    </button>
                    <Link to={`/courses/${item.course}`}>Details</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
