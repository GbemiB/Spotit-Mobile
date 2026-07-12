import { apiRequest } from './client.js';

export function getTrends(cycles, token) {
  const query = cycles ? `?cycles=${cycles}` : '';
  return apiRequest(`/insights/trends${query}`, { token });
}

export function getWeeklyDigest(token) {
  return apiRequest('/insights/digest/weekly', { token });
}

export function getRegularity(token) {
  return apiRequest('/insights/regularity', { token });
}
