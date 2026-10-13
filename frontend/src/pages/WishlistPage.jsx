import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addToCart, listCart } from "../features/cart/cartService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";
import { listWishlist, removeFromWishlist } from "../features/wishlist/wishlistService.js";
import { useAuth } from "../features/auth/useAuth.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatPrice(price) {
  const amount = Number(price || 0);
  return amount > 0 ? `$${amount.toFixed(2)}` : "Free";
}

export function WishlistPage() {
  const { access } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [cartIds, setCartIds] = useState(() => new Set());
  const [cartStatus, setCartStatus] = useState({});
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    Promise.all([listWishlist(access), listCart(access), listPublishedCourses({ page_size: 100 })])
      .then(([wishlistData, cartData, courseData]) => {
        if (!active) return;
        setWishlist(itemsFrom(wishlistData));
        const cItems = Array.isArray(cartData) ? cartData : cartData?.items || [];
        setCartIds(new Set(cItems.map((item) => Number(item.course))));
        setCourses(itemsFrom(courseData));
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load wishlist.");
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

  async function handleRemove(courseId) {
    setRemovingId(courseId);
    setMessage("");

    try {
      await removeFromWishlist(courseId, access);
      setWishlist((current) => current.filter((item) => Number(item.course) !== Number(courseId)));
    } catch (error) {
      setMessage(error.message || "Unable to remove wishlist item.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(courseId) {
    const normalizedId = Number(courseId);
    setCartStatus((current) => ({ ...current, [normalizedId]: "loading" }));
    setMessage("");

    try {
      await addToCart(normalizedId, access);
      setCartIds((current) => new Set(current).add(normalizedId));
    } catch (error) {
      setMessage(error.message || "Unable to add course to cart.");
    } finally {
      setCartStatus((current) => ({ ...current, [normalizedId]: "ready" }));
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
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>My Saved Wishlist</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage courses you want to enroll in later.</p>
        </div>
        <Link className="btn btn-outline" to="/courses">
          Explore More Courses
        </Link>
      </div>

      {message && <div style={{ color: "var(--danger)", fontWeight: 600 }}>{message}</div>}

      {wishlist.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save interesting courses while browsing so you can easily find them later."
          actionText="Browse Courses"
          actionLink="/courses"
          icon="❤️"
        />
      ) : (
        <div className="course-grid">
          {wishlist.map((item) => {
            const course = courseById.get(Number(item.course));

            return (
              <div className="card" key={item.id} style={{ display: "flex", flexDirection: "column" }}>
                <div className="course-category">{course?.category || `Course #${item.course}`}</div>
                <h3 className="course-title">{course?.title || "Saved course"}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  {course?.subtitle || course?.description || "Saved learning course"}
                </p>

                {course && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                    <span>Price: <strong>{formatPrice(course.price)}</strong></span>
                    <span>Level: <strong>{course.level || "Any"}</strong></span>
                  </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", display: "flex", gap: "0.5rem" }}>
                  {cartIds.has(Number(item.course)) ? (
                    <Link to="/cart" className="btn btn-secondary" style={{ flex: 1 }}>
                      🛒 In Cart
                    </Link>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={cartStatus[item.course] === "loading"}
                      onClick={() => handleAddToCart(item.course)}
                      type="button"
                    >
                      Move to Cart
                    </button>
                  )}

                  <button
                    className="btn btn-danger"
                    disabled={removingId === item.course}
                    onClick={() => handleRemove(item.course)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
