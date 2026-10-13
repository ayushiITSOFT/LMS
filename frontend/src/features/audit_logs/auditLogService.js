import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listAuditLogs(token) {
  return apiClient.get("audit-logs/", { headers: authHeader(token) });
}
