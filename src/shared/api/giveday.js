import { apiRequest } from './client.js';
const run = runId => `/giveday/runs/${encodeURIComponent(runId)}`;
export function startDay(token) {
  return apiRequest('/giveday/runs', { method: 'POST', token });
}
export function setHome(areaId, token) {
  return apiRequest('/giveday/home', { method: 'PUT', body: { areaId }, token });
}
export function loadArea(runId, areaId, token) {
  return apiRequest(`${run(runId)}/areas/${encodeURIComponent(areaId)}`, { token });
}
export function loadTrips(runId, placeId, token) {
  return apiRequest(`${run(runId)}/trips/${encodeURIComponent(placeId)}`, { token });
}
export function travel(runId, placeId, mode, token) {
  return apiRequest(`${run(runId)}/travel`, { method: 'POST', body: { placeId, mode }, token });
}
export function give(runId, placeId, products, token) {
  return apiRequest(`${run(runId)}/give`, { method: 'POST', body: { placeId, products }, token });
}
export function finishDay(runId, token) {
  return apiRequest(`${run(runId)}/finish`, { method: 'POST', token });
}
