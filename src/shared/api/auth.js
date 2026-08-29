import { apiRequest } from './client.js';
export function signup({ firstName, lastName, email }) {
  return apiRequest('/auth/signup', { method: 'POST', body: { firstName, lastName, email } });
}
export function verifyOtp({ otpId, code }) {
  return apiRequest('/auth/otp/verify', { method: 'POST', body: { otpId, code } });
}
export function completeSignup({ leadId, password }) {
  return apiRequest('/auth/signup/complete', { method: 'POST', body: { leadId, password } });
}
export function resendOtp({ otpId }) {
  return apiRequest('/auth/otp/resend', { method: 'POST', body: { otpId } });
}
export function login({ email, password }) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}
export function verifyLoginOtp({ otpId, code }) {
  return apiRequest('/auth/login/verify-otp', { method: 'POST', body: { otpId, code } });
}
export function forgotPassword({ email }) {
  return apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
}
export function verifyResetOtp({ email, code }) {
  return apiRequest('/auth/reset-password/verify-otp', { method: 'POST', body: { email, code } });
}
export function resetPassword({ email, code, newPassword }) {
  return apiRequest('/auth/reset-password', { method: 'POST', body: { email, code, newPassword } });
}
export function refresh({ refreshToken }) {
  return apiRequest('/auth/refresh', { method: 'POST', body: { refreshToken } });
}
export function logout(accessToken) {
  return apiRequest('/auth/logout', { method: 'POST', token: accessToken });
}
export function deleteAccount(accessToken) {
  return apiRequest('/auth/account', { method: 'DELETE', token: accessToken });
}
