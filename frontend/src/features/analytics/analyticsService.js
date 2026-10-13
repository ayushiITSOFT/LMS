import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function getCourseCompletionRate(token) {
  return apiClient.get("analytics/course-completion-rate/", { headers: authHeader(token) });
}

export function getEnrollmentTrends(token) {
  return apiClient.get("analytics/enrollment-trends/", { headers: authHeader(token) });
}

export function getRevenueTrends(token) {
  return apiClient.get("analytics/revenue-trends/", { headers: authHeader(token) });
}

export function getQuizPerformance(token) {
  return apiClient.get("analytics/quiz-performance/", { headers: authHeader(token) });
}

export function getAssignmentPerformance(token) {
  return apiClient.get("analytics/assignment-performance/", { headers: authHeader(token) });
}

export function getStudentActivity(token) {
  return apiClient.get("analytics/student-activity/", { headers: authHeader(token) });
}
