import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.js";

export function ProtectedRoute({ allowedRoles }) {
  const { canAccess, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <p className="page-message">Checking authentication...</p>;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !canAccess(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
