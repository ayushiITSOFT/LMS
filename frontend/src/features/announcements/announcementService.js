import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listCourseAnnouncements(courseId, token) {
  return apiClient.get(`announcements/courses/${courseId}/announcements/`, {
    headers: authHeader(token),
  });
}

export function createCourseAnnouncement(courseId, values, token) {
  return apiClient.post(`announcements/courses/${courseId}/announcements/`, values, {
    headers: authHeader(token),
  });
}

export function updateCourseAnnouncement(courseId, id, values, token) {
  return apiClient.patch(`announcements/courses/${courseId}/announcements/${id}/`, values, {
    headers: authHeader(token),
  });
}

export function deleteCourseAnnouncement(courseId, id, token) {
  return apiClient.delete(`announcements/courses/${courseId}/announcements/${id}/`, {
    headers: authHeader(token),
  });
}

export function pinCourseAnnouncement(courseId, id, token) {
  return apiClient.post(
    `announcements/courses/${courseId}/announcements/${id}/pin/`,
    {},
    { headers: authHeader(token) }
  );
}
