import { apiRequest } from './client.js';
export function getVersionPolicy() {
  return apiRequest('/app/version-policy');
}
