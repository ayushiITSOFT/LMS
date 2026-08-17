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
  return new URL(path, `${API_BASE_URL}/`).toString();
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest(path, options = {}) {
  const { headers, ...requestOptions } = options;
  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.non_field_errors?.[0] ||
      response.statusText ||
      "Request failed";
    throw new ApiError(message, { status: response.status, data });
  }

  return data;
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),
  put: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),
  patch: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),
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
