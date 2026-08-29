import { apiRequest } from './client.js';
export function registerDevice({ pushToken, platform }, token) {
  return apiRequest('/devices/register', { method: 'POST', body: { pushToken, platform }, token });
}
