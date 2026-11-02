import { apiRequest } from './client.js';
export function startDay(token) {
  return apiRequest('/giveday/runs', { method: 'POST', token });
}
export function give(runId, placeId, people, products, token) {
  return apiRequest(`/giveday/runs/${encodeURIComponent(runId)}/give`, { method: 'POST', body: { placeId, people, products }, token });
}
export function finishDay(runId, token) {
  return apiRequest(`/giveday/runs/${encodeURIComponent(runId)}/finish`, { method: 'POST', token });
}
