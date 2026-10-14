import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

function cartItemsFrom(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart_updated"));
  }
}

export function listCart(token) {
  return apiClient.get("cart/", { headers: authHeader(token) }).then(cartItemsFrom);
}

export async function addToCart(courseId, token) {
  const item = await apiClient.post("cart/", { course: courseId }, { headers: authHeader(token) });
  notifyCartUpdated();
  return item;
}

export async function removeFromCart(courseId, token) {
  const result = await apiClient.delete(`cart/${courseId}/`, { headers: authHeader(token) });
  notifyCartUpdated();
  return result;
}
