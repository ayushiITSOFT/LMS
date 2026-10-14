export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL");
}
