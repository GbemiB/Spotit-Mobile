import { apiRequest } from './client.js';
export function getStatus(token) {
  return apiRequest('/billing/subscription', { token });
}
export function subscribe({ planId, platform, receipt }, token) {
  return apiRequest('/billing/subscription', { method: 'POST', body: { planId, platform, receipt }, token });
}
export function cancel(token) {
  return apiRequest('/billing/subscription/cancel', { method: 'POST', token });
}
