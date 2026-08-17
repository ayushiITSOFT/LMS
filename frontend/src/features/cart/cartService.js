import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listCart(token) {
  return apiClient.get("cart/", { headers: authHeader(token) });
}

export function addToCart(courseId, token) {
  return apiClient.post("cart/", { course: courseId }, { headers: authHeader(token) });
}

export function removeFromCart(courseId, token) {
  return apiClient.delete(`cart/${courseId}/`, { headers: authHeader(token) });
}
