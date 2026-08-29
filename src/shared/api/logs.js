import { apiRequest } from './client.js';
export function getTemplate(token) {
  return apiRequest('/logs/template', { token });
}
export function getLogsInRange({ from, to }, token) {
  return apiRequest(`/logs?from=${from}&to=${to}`, { token });
}
export function saveLog(date, { flow, mood, symptoms, notes, intimate }, token) {
  return apiRequest(`/logs/${date}`, { method: 'PUT', body: { flow, mood, symptoms, notes, intimate }, token });
}
export function saveLogPeriod({ startDate, endDate, flow, mood, symptoms, notes, intimate }, token) {
  return apiRequest('/logs/period', { method: 'PUT', body: { startDate, endDate, flow, mood, symptoms, notes, intimate }, token });
}
export function deleteLog(date, token) {
  return apiRequest(`/logs/${date}`, { method: 'DELETE', token });
}
