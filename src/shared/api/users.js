import { apiRequest } from './client.js';
export function getProfile(token) {
  return apiRequest('/users/me', { token });
}
export function updateProfile({ firstName, lastName, cycleLength, periodLength, themePref }, token) {
  return apiRequest('/users/me', { method: 'PATCH', body: { firstName, lastName, cycleLength, periodLength, themePref }, token });
}
export function getNotifications(token) {
  return apiRequest('/users/me/notifications', { token });
}
export function updateNotifications({ period, ovulation, dailyLog, digest }, token) {
  return apiRequest('/users/me/notifications', { method: 'PATCH', body: { period, ovulation, dailyLog, digest }, token });
}
export function requestExport(token) {
  return apiRequest('/users/me/export', { method: 'POST', token });
}
export function downloadExport(jobId, token) {
  return apiRequest(`/users/me/export/${jobId}/download`, { token });
}
export function resetAllData(token) {
  return apiRequest('/users/me/reset', { method: 'POST', token });
}
