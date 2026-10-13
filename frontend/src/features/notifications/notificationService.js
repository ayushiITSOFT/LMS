import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listNotifications(token) {
  return apiClient.get("notifications/", { headers: authHeader(token) });
}

export function markNotificationRead(id, token) {
  return apiClient.post(
    `notifications/${id}/mark-read/`,
    {},
    { headers: authHeader(token) }
  );
}

export function markAllNotificationsRead(token) {
  return apiClient.post(
    "notifications/mark-all-read/",
    {},
    { headers: authHeader(token) }
  );
}
