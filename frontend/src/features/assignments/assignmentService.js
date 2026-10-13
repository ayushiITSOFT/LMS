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

export async function listAssignmentSubmissions(courseId, assignmentId, token) {
  const response = await apiClient.get(
    `assignment/courses/${courseId}/assignments/${assignmentId}/submissions/`,
    { headers: authHeader(token) }
  );

  return itemsFrom(response);
}

function prepareSubmissionBody(values) {
  if (!(values instanceof FormData) && values && typeof values === "object") {
    const hasFile = Object.values(values).some((v) => typeof File !== "undefined" && v instanceof File);
    if (hasFile) {
      const body = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null && values[key] !== "") {
          body.append(key, values[key]);
        }
      });
      return body;
    }
  }
  return values;
}

export function createAssignmentSubmission(courseId, assignmentId, values, token) {
  const body = prepareSubmissionBody(values);
  return apiClient.post(
    `assignment/courses/${courseId}/assignments/${assignmentId}/submissions/`,
    body,
    { headers: authHeader(token) }
  );
}

export function updateAssignmentSubmission(courseId, assignmentId, submissionId, values, token) {
  const body = prepareSubmissionBody(values);
  return apiClient.patch(
    `assignment/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/`,
    body,
    { headers: authHeader(token) }
  );
}

export function gradeAssignmentSubmission(courseId, assignmentId, submissionId, values, token) {
  return apiClient.patch(
    `assignment/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/`,
    values,
    { headers: authHeader(token) }
  );
}

export function createAssignment(courseId, values, token) {
  let body = values;
  if (!(values instanceof FormData) && values && typeof values === "object") {
    const hasFile = Object.values(values).some((v) => typeof File !== "undefined" && v instanceof File);
    if (hasFile) {
      body = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null && values[key] !== "") {
          body.append(key, values[key]);
        }
      });
    }
  }
  return apiClient.post(`assignment/courses/${courseId}/assignments/`, body, {
    headers: authHeader(token),
  });
}

