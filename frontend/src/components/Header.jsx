import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  Settings,
  CheckCircle2,
  Sun,
  Moon
} from "lucide-react";
import { ROLE_LABELS, ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";
import { listCart } from "../features/cart/cartService.js";
import { listWishlist } from "../features/wishlist/wishlistService.js";
import { listNotifications, markNotificationRead } from "../features/notifications/notificationService.js";
import { Breadcrumbs } from "./Breadcrumbs.jsx";

export function Header({ mobileMenuOpen, onToggleMobileMenu, theme, onToggleTheme }) {
  const { isAuthenticated, logout, role, user } = useAuth();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown popover states
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0);
      setWishlistCount(0);
      setUnreadNotifications(0);
      setNotificationsList([]);
      return;
    }

    let updateCartCount;
    if (role === ROLES.STUDENT) {
      updateCartCount = () => listCart()
        .then((res) => {
          setCartCount(res.length);
        })
        .catch(() => null);

      updateCartCount();
      window.addEventListener("cart_updated", updateCartCount);

      listWishlist()
        .then((res) => {
          const items = Array.isArray(res) ? res : res?.results || [];
          setWishlistCount(items.length);
        })
        .catch(() => null);
    }

    listNotifications()
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results || [];
        setNotificationsList(items.slice(0, 5));
        const unread = items.filter((n) => !n.read).length;
        setUnreadNotifications(unread);
      })
      .catch(() => null);

    return () => {
      if (updateCartCount) {
        window.removeEventListener("cart_updated", updateCartCount);
      }
    };
  }, [isAuthenticated, role]);

  async function handleLogout() {
    setShowProfileMenu(false);
    await logout();
    navigate("/login", { replace: true });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function handleNotificationClick(id) {
    markNotificationRead(id).catch(() => null);
    setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadNotifications((prev) => Math.max(0, prev - 1));
  }

  const getDashboardPath = () => {
    if (role === ROLES.ADMIN) return "/admin";
    if (role === ROLES.INSTRUCTOR) return "/instructor";
    return "/dashboard";
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-nav-toggle nav-icon-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="app-brand">
          <div className="app-brand-logo">
            <BookOpen size={18} />
          </div>
          <span>LMS</span>
        </Link>

        <div className="header-breadcrumbs-wrap">
          <Breadcrumbs />
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="header-search">
        <Search size={15} className="header-search-icon" />
        <input
          type="text"
          placeholder="Search courses, skills, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="search-shortcut-badge">⌘K</span>
      </form>

      <div className="header-right">
        {isAuthenticated ? (
          <>
            <NavLink to={getDashboardPath()} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <LayoutDashboard size={15} />
              <span className="nav-link-text">Dashboard</span>
            </NavLink>

            <div className="header-actions">
              <button
                type="button"
                className="nav-icon-btn theme-toggle-btn"
                onClick={onToggleTheme}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
              </button>

              {role === ROLES.STUDENT && (
                <>
                  <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
                    <Heart size={18} />
                    {wishlistCount > 0 && <span className="badge-counter">{wishlistCount}</span>}
                  </Link>
                  <Link to="/cart" className="nav-icon-btn" title="Cart">
                    <ShoppingCart size={18} />
                    {cartCount > 0 && <span className="badge-counter">{cartCount}</span>}
                  </Link>
                </>
              )}

              {/* Notifications Popover Dropdown */}
              <div className="dropdown-container" ref={notificationsRef}>
                <button
                  type="button"
                  className={`nav-icon-btn ${showNotificationsMenu ? "active" : ""}`}
                  title="Notifications"
                  onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                >
                  <Bell size={18} />
                  {unreadNotifications > 0 && <span className="badge-counter">{unreadNotifications}</span>}
                </button>

                {showNotificationsMenu && (
                  <div className="popover-dropdown notifications-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-title">Notifications</span>
                      {unreadNotifications > 0 && (
                        <span className="badge-ui badge-info" style={{ fontSize: "0.68rem" }}>
                          {unreadNotifications} new
                        </span>
                      )}
                    </div>
                    <div className="dropdown-body">
                      {notificationsList.length === 0 ? (
                        <div className="dropdown-empty">No notifications yet.</div>
                      ) : (
                        notificationsList.map((item) => (
                          <div
                            key={item.id}
                            className={`notification-item ${!item.read ? "unread" : ""}`}
                            onClick={() => handleNotificationClick(item.id)}
                          >
                            <div className="notification-content">
                              <p className="notification-msg">{item.verb || item.message || "Notification update"}</p>
                              <span className="notification-time">
                                {new Date(item.timestamp || item.created_at || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="dropdown-footer">
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotificationsMenu(false)}
                        className="dropdown-footer-link"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown-container" ref={profileRef}>
              <button
                type="button"
                className="user-profile-trigger-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="user-avatar">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <span className="user-name-text">{user?.username || "Account"}</span>
                {role && (
                  <span className={`header-role-badge role-badge-${role}`}>
                    {ROLE_LABELS[role] || role}
                  </span>
                )}
                <ChevronDown size={14} className="dropdown-caret" />
              </button>

              {showProfileMenu && (
                <div className="popover-dropdown profile-dropdown">
                  <div className="profile-dropdown-userinfo">
                    <div className="user-avatar lg">
                      {user?.username ? user.username.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                    <div className="user-info-text">
                      <div className="user-info-name">{user?.username || user?.email}</div>
                      <div className="user-info-email">{user?.email || "user@lms.com"}</div>
                      <span className={`role-badge ${role}`} style={{ marginTop: "0.25rem" }}>
                        {ROLE_LABELS[role] || role}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <div className="dropdown-menu-list">
                    <Link
                      to="/profile"
                      className="dropdown-menu-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User size={15} />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      to="/notifications"
                      className="dropdown-menu-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Bell size={15} />
                      <span>Notifications</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-menu-item danger"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              className="nav-icon-btn theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
            </button>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
