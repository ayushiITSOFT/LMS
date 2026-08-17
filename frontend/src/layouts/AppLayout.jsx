import { Link, Outlet, useNavigate } from "react-router-dom";
import { ROLE_LABELS, ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";

export function AppLayout() {
  const { isAuthenticated, logout, role, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-logo" to="/">
          Standalone LMS
        </Link>
        <nav className="app-nav" aria-label="Primary">
          <Link to="/courses">Courses</Link>
          {isAuthenticated ? (
            <>
              <Link to="/auth-test">{user?.username}</Link>
              {role === ROLES.ADMIN || role === ROLES.INSTRUCTOR ? (
                <Link to="/courses/new">New course</Link>
              ) : null}
              {role === ROLES.ADMIN ? <Link to="/role-test/admin">Admin</Link> : null}
              {role === ROLES.INSTRUCTOR ? (
                <Link to="/role-test/instructor">Instructor</Link>
              ) : null}
              {role === ROLES.STUDENT ? (
                <Link to="/role-test/student">Student</Link>
              ) : null}
              <span className="role-label">{ROLE_LABELS[role] || "Invalid role"}</span>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
