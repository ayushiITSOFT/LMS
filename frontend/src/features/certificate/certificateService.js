import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listCertificates(token, params = {}) {
  const query = new URLSearchParams();
  if (params.courseId) query.set("course", params.courseId);
  if (params.teaching) query.set("teaching", "true");
  const qs = query.toString();
  return apiClient.get(`certificate/${qs ? `?${qs}` : ""}`, { headers: authHeader(token) });
}

export function listCourseCertificates(courseId, token) {
  return apiClient.get(`certificate/?course=${courseId}`, { headers: authHeader(token) });
}

export function issueCertificate(courseId, token, payload = {}) {
  return apiClient.post(
    `certificate/courses/${courseId}/issue/`,
    payload,
    { headers: authHeader(token) }
  );
}

export function getCertificateDetail(id, token) {
  return apiClient.get(`certificate/${id}/`, { headers: authHeader(token) });
}

export function verifyCertificate(certificateId) {
  return apiClient.get(`certificate/verify/${certificateId}/`);
}
