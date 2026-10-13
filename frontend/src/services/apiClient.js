import { API_BASE_URL } from "../config/env.js";

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(cleanPath, `${API_BASE_URL}/`).toString();
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function getStoredAccessToken() {
  return localStorage.getItem("lms_access_token");
}

function getStoredRefreshToken() {
  return localStorage.getItem("lms_refresh_token");
}

function setStoredAccessToken(token) {
  if (token) localStorage.setItem("lms_access_token", token);
}

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAuthToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(buildUrl("accounts/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem("lms_access_token");
    localStorage.removeItem("lms_refresh_token");
    localStorage.removeItem("lms_user");
    window.dispatchEvent(new Event("auth_logout"));
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  if (data?.access) {
    setStoredAccessToken(data.access);
    return data.access;
  }
  throw new Error("Invalid token response");
}

export async function apiRequest(path, options = {}) {
  const { headers = {}, retry = true, ...requestOptions } = options;
  const storedToken = getStoredAccessToken();

  // Create clean request headers using the latest valid stored token if available
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (storedToken) {
    requestHeaders.Authorization = `Bearer ${storedToken}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(path), {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      "Unable to connect to backend API server. Please ensure the Django server is running at http://127.0.0.1:8000.",
      { status: 0, data: null }
    );
  }

  // Handle 401 Unauthorized with Token Refresh
  if (response.status === 401 && retry && !path.includes("accounts/login") && !path.includes("accounts/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccessToken = await refreshAuthToken();
        isRefreshing = false;
        onRefreshed(newAccessToken);
        const retryHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` };
        return apiRequest(path, { ...options, headers: retryHeaders, retry: false });
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        const data = await parseResponse(response);
        throw new ApiError(data?.detail || "Session expired. Please log in again.", { status: 401, data });
      }
    } else {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          apiRequest(path, { ...options, headers: retryHeaders, retry: false })
            .then(resolve)
            .catch(reject);
        });
      });
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    let message = "Request failed";
    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data && typeof data === "object") {
      message =
        data.detail ||
        data.message ||
        data.non_field_errors?.[0] ||
        (data.errors && typeof data.errors === "object" ? Object.values(data.errors).flat().join(", ") : null) ||
        Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ") ||
        response.statusText;
    }
    throw new ApiError(message, { status: response.status, data });
  }

  return data;
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const reqHeaders = { ...options?.headers };
    if (!isFormData) {
      reqHeaders["Content-Type"] = "application/json";
    }
    return apiRequest(path, {
      ...options,
      method: "POST",
      headers: reqHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },
  put: (path, body, options) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const reqHeaders = { ...options?.headers };
    if (!isFormData) {
      reqHeaders["Content-Type"] = "application/json";
    }
    return apiRequest(path, {
      ...options,
      method: "PUT",
      headers: reqHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },
  patch: (path, body, options) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const reqHeaders = { ...options?.headers };
    if (!isFormData) {
      reqHeaders["Content-Type"] = "application/json";
    }
    return apiRequest(path, {
      ...options,
      method: "PATCH",
      headers: reqHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },
  formPost: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      body,
    }),
  formPatch: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PATCH",
      body,
    }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};
