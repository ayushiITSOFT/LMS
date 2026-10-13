import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

/**
 * Uploads a file asset with proper file_type support.
 * @param {FormData|File} data - FormData instance or raw File object
 * @param {string} [token] - Optional auth token
 * @param {string} [fileType] - Optional file type if passing raw File
 */
export function uploadFile(data, token, fileType) {
  let body = data;
  if (typeof File !== "undefined" && data instanceof File) {
    body = new FormData();
    body.append("file", data);
    if (fileType) {
      body.append("file_type", fileType);
    }
  }
  return apiClient.formPost("files/upload/", body, {
    headers: authHeader(token),
  });
}
