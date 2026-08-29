import { apiRequest } from './client.js';
export function getCurrent(token) {
  return apiRequest('/cycle/current', { token });
}
export function getCalendar({ year, month }, token) {
  return apiRequest(`/cycle/calendar?year=${year}&month=${month}`, { token });
}
