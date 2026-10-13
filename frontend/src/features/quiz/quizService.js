import { authHeader } from "../auth/authService.js";
import { apiClient } from "../../services/apiClient.js";

export function listQuizzes(courseId, token) {
  return apiClient.get(`quiz/courses/${courseId}/quizzes/`, {
    headers: authHeader(token),
  });
}

export function getQuiz(courseId, quizId, token) {
  return apiClient.get(`quiz/courses/${courseId}/quizzes/${quizId}/`, {
    headers: authHeader(token),
  });
}

export function listQuizAttempts(courseId, quizId, token) {
  return apiClient.get(`quiz/courses/${courseId}/quizzes/${quizId}/attempts/`, {
    headers: authHeader(token),
  });
}

export function startQuizAttempt(courseId, quizId, token) {
  return apiClient.post(
    `quiz/courses/${courseId}/quizzes/${quizId}/attempts/`,
    {},
    { headers: authHeader(token) }
  );
}

export function getQuizAttempt(courseId, quizId, attemptId, token) {
  return apiClient.get(
    `quiz/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/`,
    { headers: authHeader(token) }
  );
}

export function submitQuizAnswer(courseId, quizId, attemptId, questionId, selectedOption, token) {
  const optionsList = Array.isArray(selectedOption) ? selectedOption : [selectedOption];
  return apiClient.post(
    `quiz/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/questions/${questionId}/answer/`,
    {
      selected_option: Array.isArray(selectedOption) ? selectedOption[0] : selectedOption,
      selected_options: optionsList,
    },
    { headers: authHeader(token) }
  );
}

export function submitQuizAttempt(courseId, quizId, attemptId, token) {
  return apiClient.post(
    `quiz/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/submit/`,
    {},
    { headers: authHeader(token) }
  );
}

export function createQuiz(courseId, values, token) {
  return apiClient.post(`quiz/courses/${courseId}/quizzes/`, values, {
    headers: authHeader(token),
  });
}

export function createQuizQuestion(courseId, quizId, values, token) {
  return apiClient.post(`quiz/courses/${courseId}/quizzes/${quizId}/questions/`, values, {
    headers: authHeader(token),
  });
}

export function deleteQuizQuestion(courseId, quizId, questionId, token) {
  return apiClient.delete(`quiz/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/`, {
    headers: authHeader(token),
  });
}

export function createQuizOption(courseId, quizId, questionId, values, token) {
  return apiClient.post(`quiz/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/options/`, values, {
    headers: authHeader(token),
  });
}
