import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export function getAdminDashboard(token) {
  return apiClient.get("accounts/admin/dashboard/", { headers: authHeader(token) });
}

export function listAdminUsers(params = {}, token = null) {
  return apiClient.get(`accounts/admin/users/${queryString(params)}`, {
    headers: authHeader(token),
  });
}

export function updateAdminUser(userId, values, token = null) {
  return apiClient.patch(`accounts/admin/users/${userId}/`, values, {
    headers: authHeader(token),
  });
}

export function deleteAdminUser(userId, token = null) {
  return apiClient.delete(`accounts/admin/users/${userId}/`, {
    headers: authHeader(token),
  });
}

export function createAdminUser(values, token = null) {
  return apiClient.post(`accounts/admin/users/`, values, {
    headers: authHeader(token),
  });
}

