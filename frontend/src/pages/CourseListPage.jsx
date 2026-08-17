import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { addToCart, listCart, removeFromCart } from "../features/cart/cartService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";
import {
  addToWishlist,
  listWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistService.js";

const FILTER_KEYS = [
  "search",
  "category",
  "instructor",
  "level",
  "language",
  "is_paid",
  "price_min",
  "price_max",
  "rating_min",
  "ordering",
  "page_size",
];

function pageItems(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function paramsFromSearch(searchParams) {
  const params = {};

  FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) params[key] = value;
  });

  params.page = searchParams.get("page") || "1";
  return params;
}

function formatPrice(price) {
  const amount = Number(price || 0);
  return amount > 0 ? `$${amount.toFixed(2)}` : "Free";
}

export function CourseListPage() {
  const { access, isAuthenticated, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => paramsFromSearch(searchParams));
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [cartIds, setCartIds] = useState(() => new Set());
  const [cartStatus, setCartStatus] = useState({});
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [wishlistStatus, setWishlistStatus] = useState({});
  const page = Number(searchParams.get("page") || "1");

  useEffect(() => {
    setFilters(paramsFromSearch(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated || role !== ROLES.STUDENT) {
      setCartIds(new Set());
      setWishlistIds(new Set());
      return;
    }

    let active = true;

    Promise.all([listCart(access), listWishlist(access)])
      .then(([cartItems, wishlistItems]) => {
        if (!active) return;
        setCartIds(new Set(cartItems.map((item) => Number(item.course))));
        setWishlistIds(new Set(wishlistItems.map((item) => Number(item.course))));
      })
      .catch(() => {
        if (!active) return;
        setCartIds(new Set());
        setWishlistIds(new Set());
      });

    return () => {
      active = false;
    };
  }, [access, isAuthenticated, role]);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setMessage("");

    listPublishedCourses(paramsFromSearch(searchParams))
      .then((data) => {
        if (!active) return;
        setCourses(pageItems(data));
        setPagination(Array.isArray(data) ? null : data);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Unable to load courses.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    const next = {};

    FILTER_KEYS.forEach((key) => {
      if (filters[key]) next[key] = filters[key];
    });

    next.page = "1";
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({ page: "1" });
  }

  function goToPage(nextPage) {
    const next = paramsFromSearch(searchParams);
    next.page = String(nextPage);
    setSearchParams(next);
  }

  async function toggleWishlist(courseId) {
    const normalizedId = Number(courseId);
    const isWishlisted = wishlistIds.has(normalizedId);
    setWishlistStatus((current) => ({ ...current, [normalizedId]: "loading" }));

    try {
      if (isWishlisted) {
        await removeFromWishlist(normalizedId, access);
      } else {
        await addToWishlist(normalizedId, access);
      }
      setWishlistIds((current) => {
        const next = new Set(current);
        if (isWishlisted) {
          next.delete(normalizedId);
        } else {
          next.add(normalizedId);
        }
        return next;
      });
    } catch (error) {
      setMessage(error.message || "Unable to update wishlist.");
    } finally {
      setWishlistStatus((current) => ({ ...current, [normalizedId]: "ready" }));
    }
  }

  async function toggleCart(courseId) {
    const normalizedId = Number(courseId);
    const isInCart = cartIds.has(normalizedId);
    setCartStatus((current) => ({ ...current, [normalizedId]: "loading" }));
    setMessage("");

    try {
      if (isInCart) {
        await removeFromCart(normalizedId, access);
      } else {
        await addToCart(normalizedId, access);
      }
      setCartIds((current) => {
        const next = new Set(current);
        if (isInCart) {
          next.delete(normalizedId);
        } else {
          next.add(normalizedId);
        }
        return next;
      });
    } catch (error) {
      setMessage(error.message || "Unable to update cart.");
    } finally {
      setCartStatus((current) => ({ ...current, [normalizedId]: "ready" }));
    }
  }

  const canCreate = role === ROLES.ADMIN || role === ROLES.INSTRUCTOR;
  const canStudentActions = isAuthenticated && role === ROLES.STUDENT;

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Courses</h1>
          <p>Browse published courses from the discovery API.</p>
        </div>
        {canCreate ? (
          <Link className="button-link" to="/courses/new">
            Create course
          </Link>
        ) : null}
      </div>

      <form className="filter-panel" onSubmit={applyFilters}>
        <label>
          Search
          <input name="search" value={filters.search || ""} onChange={updateFilter} />
        </label>
        <label>
          Category
          <input name="category" value={filters.category || ""} onChange={updateFilter} />
        </label>
        <label>
          Instructor
          <input name="instructor" value={filters.instructor || ""} onChange={updateFilter} />
        </label>
        <label>
          Level
          <select name="level" value={filters.level || ""} onChange={updateFilter}>
            <option value="">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Language
          <input name="language" value={filters.language || ""} onChange={updateFilter} />
        </label>
        <label>
          Price
          <select name="is_paid" value={filters.is_paid || ""} onChange={updateFilter}>
            <option value="">Any</option>
            <option value="false">Free</option>
            <option value="true">Paid</option>
          </select>
        </label>
        <label>
          Min price
          <input
            min="0"
            name="price_min"
            type="number"
            value={filters.price_min || ""}
            onChange={updateFilter}
          />
        </label>
        <label>
          Max price
          <input
            min="0"
            name="price_max"
            type="number"
            value={filters.price_max || ""}
            onChange={updateFilter}
          />
        </label>
        <label>
          Min rating
          <input
            max="5"
            min="0"
            name="rating_min"
            step="0.1"
            type="number"
            value={filters.rating_min || ""}
            onChange={updateFilter}
          />
        </label>
        <label>
          Sort
          <select name="ordering" value={filters.ordering || ""} onChange={updateFilter}>
            <option value="">Default</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
            <option value="price">Price low-high</option>
            <option value="-price">Price high-low</option>
            <option value="-average_rating">Top rated</option>
            <option value="-updated_at">Recently updated</option>
          </select>
        </label>
        <label>
          Per page
          <select name="page_size" value={filters.page_size || ""} onChange={updateFilter}>
            <option value="">Default</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit">Apply</button>
          <button type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </form>

      {status === "loading" ? <p className="page-message">Loading courses...</p> : null}
      {status === "error" ? <p className="form-error">{message}</p> : null}
      {status === "ready" && courses.length === 0 ? (
        <p className="page-message">No published courses found.</p>
      ) : null}

      {courses.length ? (
        <div className="course-grid">
          {courses.map((course) => (
            <article className="course-card" key={course.id}>
              <div>
                <small>
                  {course.category || "Uncategorized"} / {course.level || "Any level"}
                </small>
                <h2>{course.title}</h2>
                <p>{course.subtitle || course.description || "No description provided."}</p>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Price</dt>
                  <dd>{formatPrice(course.price)}</dd>
                </div>
                <div>
                  <dt>Language</dt>
                  <dd>{course.language || "Not set"}</dd>
                </div>
                <div>
                  <dt>Rating</dt>
                  <dd>{Number(course.average_rating || 0).toFixed(1)}</dd>
                </div>
              </dl>
              <div className="course-card-footer">
                <span>By {course.instructor || "Instructor"}</span>
                <div className="actions">
                  {canStudentActions ? (
                    <>
                      <button
                        className="cart-button"
                        disabled={cartStatus[course.id] === "loading"}
                        onClick={() => toggleCart(course.id)}
                        type="button"
                      >
                        {cartIds.has(Number(course.id)) ? "Remove cart" : "Add to cart"}
                      </button>
                      <button
                        className="wishlist-button"
                        disabled={wishlistStatus[course.id] === "loading"}
                        onClick={() => toggleWishlist(course.id)}
                        type="button"
                      >
                        {wishlistIds.has(Number(course.id)) ? "Remove" : "Wishlist"}
                      </button>
                    </>
                  ) : null}
                  <Link to={`/courses/${course.id}`}>Details</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {pagination?.count > courses.length ? (
        <div className="pagination">
          <button disabled={!pagination.previous} onClick={() => goToPage(page - 1)}>
            Previous
          </button>
          <span>Page {page}</span>
          <button disabled={!pagination.next} onClick={() => goToPage(page + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
