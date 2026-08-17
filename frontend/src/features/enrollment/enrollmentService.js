import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listEnrollments(token) {
  return apiClient.get("enrollment/my-courses/", { headers: authHeader(token) });
}

export function getEnrollment(courseId, token) {
  return apiClient.get(`enrollment/my-courses/${courseId}/`, {
    headers: authHeader(token),
  });
}
