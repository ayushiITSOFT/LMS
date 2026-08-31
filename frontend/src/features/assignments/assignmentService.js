import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

function itemsFrom(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

export function listAssignments(courseId, token) {
  return apiClient.get(`assignment/courses/${courseId}/assignments/`, {
    headers: authHeader(token),
  });
}

export function getAssignment(courseId, assignmentId, token) {
  return apiClient.get(`assignment/courses/${courseId}/assignments/${assignmentId}/`, {
    headers: authHeader(token),
  });
}

export async function getAssignmentSubmission(courseId, assignmentId, token) {
  const response = await apiClient.get(
    `assignment/courses/${courseId}/assignments/${assignmentId}/submissions/`,
    { headers: authHeader(token) }
  );

  return itemsFrom(response)[0] || null;
}

export function createAssignmentSubmission(courseId, assignmentId, values, token) {
  return apiClient.post(
    `assignment/courses/${courseId}/assignments/${assignmentId}/submissions/`,
    values,
    { headers: authHeader(token) }
  );
}

export function updateAssignmentSubmission(courseId, assignmentId, submissionId, values, token) {
  return apiClient.patch(
    `assignment/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/`,
    values,
    { headers: authHeader(token) }
  );
}

