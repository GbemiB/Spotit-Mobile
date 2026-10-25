import { apiRequest } from './client.js';
export function getVersionPolicy() {
  return apiRequest('/app/version-policy');
}
export function reportCrash(crash, token) {
  return apiRequest('/app/crashes', { method: 'POST', body: crash, token });
}
export function getSupport() {
  return apiRequest('/app/support');
}
