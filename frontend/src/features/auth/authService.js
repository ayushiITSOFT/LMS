import { apiClient } from "../../services/apiClient.js";

const ACCESS_TOKEN_KEY = "lms_access_token";
const REFRESH_TOKEN_KEY = "lms_refresh_token";
const USER_KEY = "lms_user";

export function getStoredAuth() {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    clearAuth();
  }

  return { access, refresh, user };
}

export function storeAuth({ access, refresh, user }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function registerUser(values) {
  return apiClient.post("accounts/register/", values);
}

export function loginUser(values) {
  return apiClient.post("accounts/login/", values);
}

export function refreshAccessToken(refresh) {
  return apiClient.post("accounts/refresh/", { refresh });
}

export function logoutUser({ access, refresh }) {
  return apiClient.post(
    "accounts/logout/",
    { refresh },
    { headers: authHeader(access) }
  );
}
