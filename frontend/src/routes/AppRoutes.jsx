import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute.jsx";
import { ROLES } from "../features/auth/roles.js";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AdminRoleTestPage } from "../pages/AdminRoleTestPage.jsx";
import { AuthTestPage } from "../pages/AuthTestPage.jsx";
import { CartPage } from "../pages/CartPage.jsx";
import { CourseCreatePage } from "../pages/CourseCreatePage.jsx";
import { CourseBuilderPage } from "../pages/CourseBuilderPage.jsx";
import { CourseDetailPage } from "../pages/CourseDetailPage.jsx";
import { CourseEditPage } from "../pages/CourseEditPage.jsx";
import { CourseListPage } from "../pages/CourseListPage.jsx";
import { CoursePreviewPage } from "../pages/CoursePreviewPage.jsx";
import { HomePage } from "../pages/HomePage.jsx";
import { InstructorRoleTestPage } from "../pages/InstructorRoleTestPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { RegisterPage } from "../pages/RegisterPage.jsx";
import { StudentRoleTestPage } from "../pages/StudentRoleTestPage.jsx";
import { UnauthorizedPage } from "../pages/UnauthorizedPage.jsx";
import { WishlistPage } from "../pages/WishlistPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CourseListPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="auth-test" element={<AuthTestPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]} />}>
          <Route path="courses/new" element={<CourseCreatePage />} />
          <Route path="courses/:id/builder" element={<CourseBuilderPage />} />
          <Route path="courses/:id/edit" element={<CourseEditPage />} />
          <Route path="courses/:id/preview" element={<CoursePreviewPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="role-test/admin" element={<AdminRoleTestPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]} />}>
          <Route path="role-test/instructor" element={<InstructorRoleTestPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="role-test/student" element={<StudentRoleTestPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
