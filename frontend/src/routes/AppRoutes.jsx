import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute.jsx";
import { ROLES } from "../features/auth/roles.js";
import { AppLayout } from "../layouts/AppLayout.jsx";

// Auth & Public Pages
import { LoginPage } from "../pages/LoginPage.jsx";
import { RegisterPage } from "../pages/RegisterPage.jsx";
import { UnauthorizedPage } from "../pages/UnauthorizedPage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { PrivacyPage } from "../pages/PrivacyPage.jsx";
import { TermsPage } from "../pages/TermsPage.jsx";
import { AboutPage } from "../pages/AboutPage.jsx";
import { ContactPage } from "../pages/ContactPage.jsx";

// Protected Platform Pages
import { HomePage } from "../pages/HomePage.jsx";
import { CourseListPage } from "../pages/CourseListPage.jsx";
import { CourseDetailPage } from "../pages/CourseDetailPage.jsx";
import { StudentDashboardPage } from "../pages/StudentDashboardPage.jsx";
import { ProfilePage } from "../pages/ProfilePage.jsx";
import { CartPage } from "../pages/CartPage.jsx";
import { CheckoutPage } from "../pages/CheckoutPage.jsx";
import { PaymentPage } from "../pages/PaymentPage.jsx";
import { EnrollmentListPage } from "../pages/EnrollmentListPage.jsx";
import { EnrollmentDetailPage } from "../pages/EnrollmentDetailPage.jsx";
import { AssignmentPage } from "../pages/AssignmentPage.jsx";
import { QuizPage } from "../pages/QuizPage.jsx";
import { CertificatesPage } from "../pages/CertificatesPage.jsx";
import { CertificateVerificationPage } from "../pages/CertificateVerificationPage.jsx";
import { OrderListPage } from "../pages/OrderListPage.jsx";
import { OrderDetailPage } from "../pages/OrderDetailPage.jsx";
import { WishlistPage } from "../pages/WishlistPage.jsx";
import { NotificationsPage } from "../pages/NotificationsPage.jsx";

// Instructor Pages
import { InstructorDashboardPage } from "../pages/InstructorDashboardPage.jsx";
import { InstructorCourseListPage } from "../pages/InstructorCourseListPage.jsx";
import { CourseCreatePage } from "../pages/CourseCreatePage.jsx";
import { CourseEditPage } from "../pages/CourseEditPage.jsx";
import { CourseBuilderPage } from "../pages/CourseBuilderPage.jsx";
import { CoursePreviewPage } from "../pages/CoursePreviewPage.jsx";

// Admin Pages
import { AdminDashboardPage } from "../pages/AdminDashboardPage.jsx";
import { AdminEnrollmentsPage } from "../pages/AdminEnrollmentsPage.jsx";
import { AdminUserListPage } from "../pages/AdminUserListPage.jsx";
import { AnalyticsPage } from "../pages/AnalyticsPage.jsx";
import { AnnouncementsPage } from "../pages/AnnouncementsPage.jsx";
import { FileManagementPage } from "../pages/FileManagementPage.jsx";
import { AuditLogsPage } from "../pages/AuditLogsPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Unauthenticated / Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="courses" element={<CourseListPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="courses/:id/preview" element={<CoursePreviewPage />} />
        <Route path="verify/:certificateId" element={<CertificateVerificationPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />

        {/* Authenticated Platform & Learning Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="my-courses" element={<EnrollmentListPage />} />
          <Route path="my-courses/:id" element={<EnrollmentDetailPage />} />
          <Route path="my-courses/:courseId/assignments" element={<AssignmentPage />} />
          <Route path="my-courses/:courseId/assignments/:assignmentId" element={<AssignmentPage />} />
          <Route path="my-courses/:courseId/quizzes/:quizId" element={<QuizPage />} />
        </Route>

        {/* Student Role Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>

        {/* Instructor & Admin Course Management Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR, ROLES.ADMIN]} />}>
          <Route path="courses/:id/builder" element={<CourseBuilderPage />} />
          <Route path="instructor/courses/:id/builder" element={<CourseBuilderPage />} />
          <Route path="instructor/courses/:id/preview" element={<CoursePreviewPage />} />
          <Route path="instructor/courses/:id/edit" element={<CourseEditPage />} />
        </Route>

        {/* Instructor Role Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]} />}>
          <Route path="instructor" element={<InstructorDashboardPage />} />
          <Route path="instructor/courses" element={<InstructorCourseListPage />} />
          <Route path="instructor/courses/create" element={<CourseCreatePage />} />
          <Route path="instructor/announcements" element={<AnnouncementsPage />} />
          <Route path="instructor/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Admin Role Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<AdminUserListPage />} />
          <Route path="admin/courses" element={<InstructorCourseListPage />} />
          <Route path="admin/orders" element={<OrderListPage />} />
          <Route path="admin/enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="admin/analytics" element={<AnalyticsPage />} />
          <Route path="admin/announcements" element={<AnnouncementsPage />} />
          <Route path="admin/notifications" element={<NotificationsPage />} />
          <Route path="admin/files" element={<FileManagementPage />} />
          <Route path="admin/audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

