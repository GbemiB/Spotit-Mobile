import { apiRequest } from './client.js';
export function getHome(token) {
  return apiRequest('/quiz/home', { token });
}
export function getTopics({ limit, cursor, group } = {}, token) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (cursor) params.set('cursor', cursor);
  if (group) params.set('group', group);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/quiz/topics${query}`, { token });
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
