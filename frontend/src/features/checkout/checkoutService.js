import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart_updated"));
  }
}

export function createCheckout(token) {
  return apiClient.post("checkout/", {}, { headers: authHeader(token) });
}

export async function processPayment(token) {
  const result = await apiClient.post("payment/", {}, { headers: authHeader(token) });
  notifyCartUpdated();
  return result;
}

export const completeFreeCheckout = processPayment;
