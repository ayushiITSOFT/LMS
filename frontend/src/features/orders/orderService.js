import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listOrders(token) {
  return apiClient.get("orders/", { headers: authHeader(token) });
}
