import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { Sidebar } from "../components/Sidebar.jsx";
import { useAuth } from "../features/auth/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";

export function AppLayout() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Paths where sidebar should be visible if user is authenticated
  const isSidebarRoute =
    isAuthenticated &&
    !["/", "/courses", "/login", "/register", "/unauthorized", "/privacy", "/terms"].includes(location.pathname) &&
    !location.pathname.startsWith("/courses/");

  const roleAttr = role ? role.toLowerCase() : "guest";

  return (
    <div className="app-shell" data-role={roleAttr}>
      <Header
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Mobile Drawer Sheet Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Off-canvas Mobile Drawer */}
      <div className={`mobile-drawer-sheet ${mobileMenuOpen ? "open" : ""}`}>
        <Sidebar />
      </div>

      {isSidebarRoute ? (
        <div className="sidebar-layout">
          <Sidebar />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className={["/login", "/register"].includes(location.pathname) ? "app-main-fullbleed" : "app-main"}>
          <Outlet />
        </main>
      )}

      <Footer />
    </div>
  );
}
