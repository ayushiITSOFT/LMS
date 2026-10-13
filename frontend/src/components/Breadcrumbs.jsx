import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_NAME_MAP = {
  dashboard: "Dashboard",
  "my-courses": "My Learning",
  certificates: "Certificates",
  wishlist: "Wishlist",
  cart: "Cart",
  checkout: "Checkout",
  payment: "Payment",
  orders: "Order History",
  notifications: "Notifications",
  profile: "Account Profile",
  courses: "Explore Courses",
  instructor: "Instructor Studio",
  announcements: "Announcements",
  analytics: "Analytics",
  admin: "Admin Console",
  enrollments: "Enrollments",
  files: "File Manager",
  "audit-logs": "Audit Logs",
  create: "Create Course",
  builder: "Course Builder",
  edit: "Edit Course",
  preview: "Preview",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) {
    return (
      <div className="breadcrumbs-ui">
        <Home size={14} className="breadcrumb-icon" />
        <span className="breadcrumb-current">Home</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-ui">
      <Link to="/" className="breadcrumb-item" title="Home">
        <Home size={14} />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = ROUTE_NAME_MAP[value] || (isNaN(value) ? value.replace(/-/g, " ") : `#${value}`);

        return (
          <span key={to} className="breadcrumb-segment">
            <ChevronRight size={13} className="breadcrumb-separator" />
            {isLast ? (
              <span className="breadcrumb-current">{displayName}</span>
            ) : (
              <Link to={to} className="breadcrumb-item">
                {displayName}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
