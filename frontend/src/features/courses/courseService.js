import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

function queryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export function listPublishedCourses(params = {}, token = null) {
  return apiClient.get(`courses/discover/${queryString(params)}`, {
    headers: authHeader(token),
  });
}

export function getCourse(id, token) {
  return apiClient.get(`courses/${id}/`, { headers: authHeader(token) });
}

export function getInstructorDashboard(token) {
  return apiClient.get("courses/instructor/dashboard/", { headers: authHeader(token) });
}

export function getCoursePreview(id, token) {
  return apiClient.get(`courses/${id}/preview/`, { headers: authHeader(token) });
}

function courseFormData(values) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
}

export function createCourse(values, token) {
  if (values instanceof FormData || values?.thumbnail instanceof File) {
    const body = values instanceof FormData ? values : courseFormData(values);
    return apiClient.formPost("courses/", body, { headers: authHeader(token) });
  }
  return apiClient.post("courses/", values, { headers: authHeader(token) });
}

export function updateCourse(id, values, token) {
  if (values instanceof FormData || values?.thumbnail instanceof File) {
    const body = values instanceof FormData ? values : courseFormData(values);
    return apiClient.formPatch(`courses/${id}/`, body, { headers: authHeader(token) });
  }
  return apiClient.patch(`courses/${id}/`, values, { headers: authHeader(token) });
}

export function updateCoursePricing(id, values, token) {
  return updateCourse(id, values, token);
}

export function publishCourse(id, token) {
  return apiClient.post(`courses/${id}/publish/`, {}, { headers: authHeader(token) });
}

export function deleteCourse(id, token) {
  return apiClient.delete(`courses/${id}/`, { headers: authHeader(token) });
}

export function listSections(courseId, token) {
  return apiClient.get(`courses/${courseId}/sections/`, { headers: authHeader(token) });
}

export function createSection(courseId, values, token) {
  return apiClient.post(`courses/${courseId}/sections/`, values, {
    headers: authHeader(token),
  });
}

export function updateSection(courseId, sectionId, values, token) {
  return apiClient.patch(`courses/${courseId}/sections/${sectionId}/`, values, {
    headers: authHeader(token),
  });
}

export function deleteSection(courseId, sectionId, token) {
  return apiClient.delete(`courses/${courseId}/sections/${sectionId}/`, {
    headers: authHeader(token),
  });
}

export function listLessons(courseId, sectionId, token) {
  return apiClient.get(`courses/${courseId}/sections/${sectionId}/lessons/`, {
    headers: authHeader(token),
  });
}

export function createLesson(courseId, sectionId, values, token) {
  return apiClient.formPost(
    `courses/${courseId}/sections/${sectionId}/lessons/`,
    lessonFormData(values),
    { headers: authHeader(token) }
  );
}

export function updateLesson(courseId, sectionId, lessonId, values, token) {
  return apiClient.formPatch(
    `courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/`,
    lessonFormData(values),
    { headers: authHeader(token) }
  );
}

export function deleteLesson(courseId, sectionId, lessonId, token) {
  return apiClient.delete(
    `courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/`,
    { headers: authHeader(token) }
  );
}

function lessonFormData(values) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
}
