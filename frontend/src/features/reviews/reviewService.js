import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listCourseReviews(courseId) {
  return apiClient.get(`reviews/courses/${courseId}/reviews/`);
}

export function createCourseReview(courseId, values, token) {
  return apiClient.post(
    `reviews/courses/${courseId}/reviews/`,
    values,
    { headers: authHeader(token) }
  );
}

export function deleteCourseReview(courseId, reviewId, token) {
  return apiClient.delete(`reviews/courses/${courseId}/reviews/${reviewId}/`, {
    headers: authHeader(token),
  });
}
