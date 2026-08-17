import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { addToCart, listCart, removeFromCart } from "../features/cart/cartService.js";
import { CoursePublishPanel } from "../features/courses/CoursePublishPanel.jsx";
import { deleteCourse, getCourse } from "../features/courses/courseService.js";
import {
  addToWishlist,
  listWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistService.js";

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access, role, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [isInCart, setIsInCart] = useState(false);
  const [cartStatus, setCartStatus] = useState("ready");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState("ready");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    getCourse(id, access)
      .then((data) => {
        if (!active) return;
        setCourse(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load course.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [access, id]);

  useEffect(() => {
    if (role !== ROLES.STUDENT) return;

    let active = true;

    Promise.all([listCart(access), listWishlist(access)])
      .then(([cartItems, wishlistItems]) => {
        if (!active) return;
        setIsInCart(cartItems.some((item) => Number(item.course) === Number(id)));
        setIsWishlisted(wishlistItems.some((item) => Number(item.course) === Number(id)));
      })
      .catch(() => {
        if (!active) return;
        setIsInCart(false);
        setIsWishlisted(false);
      });

    return () => {
      active = false;
    };
  }, [access, id, role]);

  const canManage =
    role === ROLES.ADMIN || (role === ROLES.INSTRUCTOR && course?.instructor === user?.id);
  const canStudentActions = role === ROLES.STUDENT;

  async function handleDelete() {
    if (!window.confirm("Delete this course?")) return;

    try {
      await deleteCourse(id, access);
      navigate("/courses", { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to delete course.");
    }
  }

  async function toggleWishlist() {
    setWishlistStatus("loading");
    setMessage("");

    try {
      if (isWishlisted) {
        await removeFromWishlist(id, access);
      } else {
        await addToWishlist(id, access);
      }
      setIsWishlisted((current) => !current);
    } catch (error) {
      setMessage(error.message || "Unable to update wishlist.");
    } finally {
      setWishlistStatus("ready");
    }
  }

  async function toggleCart() {
    setCartStatus("loading");
    setMessage("");

    try {
      if (isInCart) {
        await removeFromCart(id, access);
      } else {
        await addToCart(id, access);
      }
      setIsInCart((current) => !current);
    } catch (error) {
      setMessage(error.message || "Unable to update cart.");
    } finally {
      setCartStatus("ready");
    }
  }

  if (status === "loading") {
    return <p className="page-message">Loading course...</p>;
  }

  if (status === "error") {
    return <p className="form-error">{message}</p>;
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>{course.title}</h1>
          <p>{course.subtitle || course.category}</p>
        </div>
        {canManage || canStudentActions ? (
          <div className="actions">
            {canStudentActions ? (
              <>
                <button
                  className="cart-button"
                  disabled={cartStatus === "loading"}
                  onClick={toggleCart}
                  type="button"
                >
                  {isInCart ? "Remove from cart" : "Add to cart"}
                </button>
                <button
                  className="wishlist-button"
                  disabled={wishlistStatus === "loading"}
                  onClick={toggleWishlist}
                  type="button"
                >
                  {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                </button>
              </>
            ) : null}
            {canManage ? (
              <>
                <Link className="button-link" to={`/courses/${course.id}/edit`}>
                  Edit
                </Link>
                <Link className="button-link" to={`/courses/${course.id}/builder`}>
                  Builder
                </Link>
                <Link className="button-link" to={`/courses/${course.id}/preview`}>
                  Preview
                </Link>
                <button className="danger-button" onClick={handleDelete} type="button">
                  Delete
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      <dl className="detail-list">
        <div>
          <dt>Category</dt>
          <dd>{course.category}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{course.level}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>{course.language}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{course.status}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>{Number(course.price || 0) > 0 ? `$${Number(course.price).toFixed(2)}` : "Free"}</dd>
        </div>
      </dl>
      <p>{course.description || "No description provided."}</p>
      {canManage ? (
        <CoursePublishPanel course={course} onPublished={setCourse} token={access} />
      ) : null}
    </section>
  );
}
