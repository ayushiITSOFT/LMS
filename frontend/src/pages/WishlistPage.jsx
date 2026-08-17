import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addToCart, listCart } from "../features/cart/cartService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";
import { listWishlist, removeFromWishlist } from "../features/wishlist/wishlistService.js";
import { useAuth } from "../features/auth/useAuth.js";

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
        setCartIds(new Set(itemsFrom(cartData).map((item) => Number(item.course))));
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
    return <p className="page-message">Loading wishlist...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Wishlist</h1>
          <p>Your saved courses.</p>
        </div>
        <Link className="button-link" to="/courses">
          Browse courses
        </Link>
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      {wishlist.length === 0 ? <p className="page-message">Your wishlist is empty.</p> : null}
      {wishlist.length ? (
        <div className="course-grid">
          {wishlist.map((item) => {
            const course = courseById.get(Number(item.course));

            return (
              <article className="course-card" key={item.id}>
                <div>
                  <small>{course?.category || `Course #${item.course}`}</small>
                  <h2>{course?.title || "Saved course"}</h2>
                  <p>{course?.subtitle || course?.description || "Course details require access."}</p>
                </div>
                {course ? (
                  <dl className="detail-list">
                    <div>
                      <dt>Price</dt>
                      <dd>{formatPrice(course.price)}</dd>
                    </div>
                    <div>
                      <dt>Level</dt>
                      <dd>{course.level || "Not set"}</dd>
                    </div>
                    <div>
                      <dt>Rating</dt>
                      <dd>{Number(course.average_rating || 0).toFixed(1)}</dd>
                    </div>
                  </dl>
                ) : null}
                <div className="course-card-footer">
                  <span>Saved {new Date(item.created_at).toLocaleDateString()}</span>
                  <div className="actions">
                    {cartIds.has(Number(item.course)) ? (
                      <Link to="/cart">In cart</Link>
                    ) : (
                      <button
                        className="cart-button"
                        disabled={cartStatus[item.course] === "loading"}
                        onClick={() => handleAddToCart(item.course)}
                        type="button"
                      >
                        Add to cart
                      </button>
                    )}
                    <button
                      className="wishlist-button"
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
