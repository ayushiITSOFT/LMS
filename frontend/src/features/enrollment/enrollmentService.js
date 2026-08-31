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

export function getResumeLesson(courseId, token) {
  return apiClient.get(`enrollment/my-courses/${courseId}/resume/`, {
    headers: authHeader(token),
  });
}

export function completeLesson(courseId, lessonId, token) {
  return apiClient.post(
    `enrollment/my-courses/${courseId}/lessons/${lessonId}/complete/`,
    {},
    { headers: authHeader(token) }
  );
}

export function getStudentDashboard(token) {
  return apiClient.get("enrollment/dashboard/", { headers: authHeader(token) });
}
