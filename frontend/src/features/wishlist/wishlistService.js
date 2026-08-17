import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listWishlist(token) {
  return apiClient.get("wishlist/", { headers: authHeader(token) });
}

export function addToWishlist(courseId, token) {
  return apiClient.post("wishlist/", { course: courseId }, { headers: authHeader(token) });
}

export function removeFromWishlist(courseId, token) {
  return apiClient.delete(`wishlist/${courseId}/`, { headers: authHeader(token) });
}
