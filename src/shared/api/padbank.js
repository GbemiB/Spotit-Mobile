import { apiRequest } from './client.js';
export function startRun(day, token) {
  return apiRequest('/padbank/runs', { method: 'POST', body: { day }, token });
}
export function serve(runId, round, pack, route, token) {
  return apiRequest(`/padbank/runs/${encodeURIComponent(runId)}/serve`, { method: 'POST', body: { round, pack, route }, token });
}
export function getRules(token) {
  return apiRequest('/padbank/rules', { token });
}
export function closeBank(runId, token) {
  return apiRequest(`/padbank/runs/${encodeURIComponent(runId)}/close`, { method: 'POST', token });
}
