import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Plus, RotateCcw, Filter } from "lucide-react";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { addToCart, listCart, removeFromCart } from "../features/cart/cartService.js";
import { listPublishedCourses } from "../features/courses/courseService.js";
import {
  addToWishlist,
  listWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistService.js";
import { CourseCard } from "../components/CourseCard.jsx";
import { CourseCardSkeleton } from "../components/Skeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

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

export function CourseListPage() {
  const { access, isAuthenticated, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => paramsFromSearch(searchParams));
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [cartIds, setCartIds] = useState(() => new Set());
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
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
        const wItems = Array.isArray(wishlistItems) ? wishlistItems : wishlistItems?.results || [];
        setCartIds(new Set(cartItems.map((item) => Number(item.course))));
        setWishlistIds(new Set(wItems.map((item) => Number(item.course))));
      })
      .catch(() => null);

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
        setMessage(error.message || "Unable to load courses from the backend.");
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
    if (event) event.preventDefault();
    const next = {};

    FILTER_KEYS.forEach((key) => {
      if (filters[key]) next[key] = filters[key];
    });

    next.page = "1";
    setSearchParams(next);
  }

  function clearFilters() {
    setFilters({});
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
    }
  }

  async function toggleCart(courseId) {
    const normalizedId = Number(courseId);
    const isInCart = cartIds.has(normalizedId);

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
    }
  }

  const canCreate = role === ROLES.ADMIN || role === ROLES.INSTRUCTOR;
  const activeFilterCount = FILTER_KEYS.filter((k) => k !== "page" && k !== "page_size" && filters[k]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Course Marketplace</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Explore industry-leading courses and expand your expertise.
          </p>
        </div>
        {canCreate && (
          <Link className="btn btn-primary" to="/instructor/courses/create">
            <Plus size={16} />
            <span>Create New Course</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <form className="card" onSubmit={applyFilters} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Query</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                name="search"
                placeholder="Search topics, skills..."
                value={filters.search || ""}
                onChange={updateFilter}
                style={{ paddingLeft: "2.25rem" }}
              />
              <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <input className="input" name="category" placeholder="Category name..." value={filters.category || ""} onChange={updateFilter} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Price Type</label>
            <select className="select" name="is_paid" value={filters.is_paid || ""} onChange={updateFilter}>
              <option value="">All Prices</option>
              <option value="false">Free Courses</option>
              <option value="true">Paid Courses</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sort By</label>
            <select className="select" name="ordering" value={filters.ordering || ""} onChange={updateFilter}>
              <option value="">Newest First</option>
              <option value="title">Title A-Z</option>
              <option value="price">Price Low-High</option>
              <option value="-price">Price High-Low</option>
              <option value="-average_rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={14} />
            <span>{pagination?.count !== undefined ? `${pagination.count} courses available` : "Filtering catalog"}</span>
            {activeFilterCount > 0 && (
              <span className="badge badge-info">{activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm">
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {/* Content Rendering */}
      {status === "loading" ? (
        <div className="course-grid">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      ) : status === "error" ? (
        <ErrorState message={message} onRetry={() => setSearchParams({ page: "1" })} />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses match your search"
          description="Try adjusting your search query, changing categories, or resetting filters."
          actionText="Clear All Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onWishlistToggle={role === ROLES.STUDENT ? toggleWishlist : null}
              onAddToCart={role === ROLES.STUDENT ? toggleCart : null}
              isWishlisted={wishlistIds.has(Number(course.id))}
              isInCart={cartIds.has(Number(course.id))}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (pagination.previous || pagination.next) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Page <strong>{page}</strong>
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.previous} onClick={() => goToPage(page - 1)}>
              ← Previous
            </button>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.next} onClick={() => goToPage(page + 1)}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
