import { apiRequest } from './client.js';
export function getHome(token) {
  return apiRequest('/quiz/home', { token });
}
export function getTopics(token) {
  return apiRequest('/quiz/topics', { token });
}
export function getTopic(topicId, token) {
  return apiRequest(`/quiz/topics/${encodeURIComponent(topicId)}`, { token });
}
export function startLevel({ topicId, level }, token) {
  return apiRequest('/quiz/attempts', { method: 'POST', body: { topicId, level }, token });
}
export function takeHint(attemptId, round, token) {
  return apiRequest(`/quiz/attempts/${attemptId}/hint`, { method: 'POST', body: { round }, token });
}
export function answer(attemptId, round, choice, token) {
  return apiRequest(`/quiz/attempts/${attemptId}/answers`, { method: 'POST', body: { round, choice }, token });
}
