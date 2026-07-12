import { apiRequest } from './client.js';

export function registerDevice({ pushToken, platform }, token) {
  return apiRequest('/devices/register', { method: 'POST', body: { pushToken, platform }, token });
}

export function unregisterDevice(pushToken, token) {
  return apiRequest(`/devices/${pushToken}`, { method: 'DELETE', token });
}
