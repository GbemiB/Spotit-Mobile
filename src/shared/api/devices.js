import { apiRequest } from './client.js';
export function registerDevice({ pushToken, platform, timeZone }, token) {
  return apiRequest('/devices/register', { method: 'POST', body: { pushToken, platform, timeZone }, token });
}
export function unregisterDevice(pushToken, token) {
  return apiRequest(`/devices/${encodeURIComponent(pushToken)}`, { method: 'DELETE', token });
}
