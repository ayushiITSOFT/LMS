import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function createCheckout(token) {
  return apiClient.post("checkout/", {}, { headers: authHeader(token) });
}

export function processPayment(token) {
  return apiClient.post("payment/", {}, { headers: authHeader(token) });
}

export const completeFreeCheckout = processPayment;
