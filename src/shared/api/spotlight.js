import { apiRequest } from './client.js';
export function getHome(token) {
  return apiRequest('/spotlight/home', { token });
}
