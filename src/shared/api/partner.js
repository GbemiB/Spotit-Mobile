import { apiRequest } from './client.js';
export function getPartnerStatus(token) {
  return apiRequest('/partner/status', { token });
}
export function invitePartner(email, token) {
  return apiRequest('/partner/invite', { method: 'POST', body: { email }, token });
}
export function resendPartnerInvite(token) {
  return apiRequest('/partner/invite/resend', { method: 'POST', token });
}
export function cancelPartnerInvite(token) {
  return apiRequest('/partner/invite', { method: 'DELETE', token });
}
export function acceptPartnerInvite({ code, nickname }, token) {
  return apiRequest('/partner/accept', { method: 'POST', body: { code, nickname }, token });
}
export function getPartnerProfile(token) {
  return apiRequest('/partner/profile', { token });
}
export function getPartnerCheckIn(token) {
  return apiRequest('/partner/check-in', { token });
}
export function partnerCheckIn({ kind = null, supports = [], note = null, expression = null }, token) {
  return apiRequest('/partner/check-in', { method: 'POST', body: { kind, supports, note, expression }, token });
}
export function getPartnerLove({ from, to }, token) {
  return apiRequest(`/partner/love?from=${from}&to=${to}`, { token });
}
export function updatePartnerSettings(changes, token) {
  return apiRequest('/partner/settings', { method: 'PATCH', body: changes, token });
}
export function stopPartnerSharing(token) {
  return apiRequest('/partner', { method: 'DELETE', token });
}
