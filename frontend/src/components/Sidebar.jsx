import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Heart,
  ShoppingCart,
  Package,
  Bell,
  User,
  PlusCircle,
  BarChart3,
  Megaphone,
  CreditCard,
  Users,
  Folder,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { ROLES } from "../features/auth/roles.js";
import { useAuth } from "../features/auth/useAuth.js";

export function Sidebar({ collapsed: externalCollapsed, onToggleCollapse }) {
  const { role } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    return localStorage.getItem("lms_sidebar_collapsed") === "true";
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    localStorage.setItem("lms_sidebar_collapsed", String(next));
    if (onToggleCollapse) onToggleCollapse(next);
  };

  if (!role) return null;

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header Collapse Toggle */}
      <div className="sidebar-header">
        {!isCollapsed && <span className="sidebar-brand-label">Navigation</span>}
        <button
          type="button"
          onClick={toggleCollapse}
          className="sidebar-collapse-btn"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="sidebar-content">
        {role === ROLES.STUDENT && (
          <>
            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "Student Portal"}
            </div>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Dashboard" : undefined}>
              <span className="sidebar-item-icon"><LayoutDashboard size={18} /></span>
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/my-courses" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "My Learning" : undefined}>
              <span className="sidebar-item-icon"><GraduationCap size={18} /></span>
              {!isCollapsed && <span>My Learning</span>}
            </NavLink>
            <NavLink to="/certificates" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Certificates" : undefined}>
              <span className="sidebar-item-icon"><Award size={18} /></span>
              {!isCollapsed && <span>Certificates</span>}
            </NavLink>

            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "Commerce"}
            </div>
            <NavLink to="/wishlist" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Wishlist" : undefined}>
              <span className="sidebar-item-icon"><Heart size={18} /></span>
              {!isCollapsed && <span>Wishlist</span>}
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Cart" : undefined}>
              <span className="sidebar-item-icon"><ShoppingCart size={18} /></span>
              {!isCollapsed && <span>Cart</span>}
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Orders" : undefined}>
              <span className="sidebar-item-icon"><Package size={18} /></span>
              {!isCollapsed && <span>Orders</span>}
            </NavLink>

            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "Account"}
            </div>
            <NavLink to="/notifications" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Notifications" : undefined}>
              <span className="sidebar-item-icon"><Bell size={18} /></span>
              {!isCollapsed && <span>Notifications</span>}
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Profile" : undefined}>
              <span className="sidebar-item-icon"><User size={18} /></span>
              {!isCollapsed && <span>Profile</span>}
            </NavLink>
          </>
        )}

        {role === ROLES.INSTRUCTOR && (
          <>
            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "Instructor Studio"}
            </div>
            <NavLink to="/instructor" end className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Overview" : undefined}>
              <span className="sidebar-item-icon"><LayoutDashboard size={18} /></span>
              {!isCollapsed && <span>Overview</span>}
            </NavLink>
            <NavLink to="/instructor/courses" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "My Courses" : undefined}>
              <span className="sidebar-item-icon"><BookOpen size={18} /></span>
              {!isCollapsed && <span>My Courses</span>}
            </NavLink>
            <NavLink to="/instructor/courses/create" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Create Course" : undefined}>
              <span className="sidebar-item-icon"><PlusCircle size={18} /></span>
              {!isCollapsed && <span>Create Course</span>}
            </NavLink>
            <NavLink to="/instructor/announcements" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Announcements" : undefined}>
              <span className="sidebar-item-icon"><Megaphone size={18} /></span>
              {!isCollapsed && <span>Announcements</span>}
            </NavLink>
            <NavLink to="/instructor/analytics" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Analytics" : undefined}>
              <span className="sidebar-item-icon"><BarChart3 size={18} /></span>
              {!isCollapsed && <span>Analytics</span>}
            </NavLink>

            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "Account"}
            </div>
            <NavLink to="/notifications" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Notifications" : undefined}>
              <span className="sidebar-item-icon"><Bell size={18} /></span>
              {!isCollapsed && <span>Notifications</span>}
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Profile" : undefined}>
              <span className="sidebar-item-icon"><User size={18} /></span>
              {!isCollapsed && <span>Profile</span>}
            </NavLink>
          </>
        )}

        {role === ROLES.ADMIN && (
          <>
            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "Admin Console"}
            </div>
            <NavLink to="/admin" end className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Overview" : undefined}>
              <span className="sidebar-item-icon"><LayoutDashboard size={18} /></span>
              {!isCollapsed && <span>Overview</span>}
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "User Governance" : undefined}>
              <span className="sidebar-item-icon"><Users size={18} /></span>
              {!isCollapsed && <span>User Governance</span>}
            </NavLink>
            <NavLink to="/admin/courses" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Courses" : undefined}>
              <span className="sidebar-item-icon"><BookOpen size={18} /></span>
              {!isCollapsed && <span>Courses</span>}
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Orders & Revenue" : undefined}>
              <span className="sidebar-item-icon"><CreditCard size={18} /></span>
              {!isCollapsed && <span>Orders & Revenue</span>}
            </NavLink>
            <NavLink to="/admin/enrollments" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Enrollments" : undefined}>
              <span className="sidebar-item-icon"><Users size={18} /></span>
              {!isCollapsed && <span>Enrollments</span>}
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Platform Analytics" : undefined}>
              <span className="sidebar-item-icon"><BarChart3 size={18} /></span>
              {!isCollapsed && <span>Platform Analytics</span>}
            </NavLink>

            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "System Management"}
            </div>
            <NavLink to="/admin/announcements" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Announcements" : undefined}>
              <span className="sidebar-item-icon"><Megaphone size={18} /></span>
              {!isCollapsed && <span>Announcements</span>}
            </NavLink>
            <NavLink to="/admin/files" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "File Manager" : undefined}>
              <span className="sidebar-item-icon"><Folder size={18} /></span>
              {!isCollapsed && <span>File Manager</span>}
            </NavLink>
            <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Audit Logs" : undefined}>
              <span className="sidebar-item-icon"><ShieldAlert size={18} /></span>
              {!isCollapsed && <span>Audit Logs</span>}
            </NavLink>

            <div className="sidebar-group-title">
              {isCollapsed ? <span className="group-divider" /> : "Account"}
            </div>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={isCollapsed ? "Profile" : undefined}>
              <span className="sidebar-item-icon"><User size={18} /></span>
              {!isCollapsed && <span>Profile</span>}
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}
