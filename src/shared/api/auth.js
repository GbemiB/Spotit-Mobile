import { apiRequest } from './client.js';

export function signup({ firstName, lastName, email, password }) {
  return apiRequest('/auth/signup', { method: 'POST', body: { firstName, lastName, email, password } });
}

export function verifyOtp({ otpId, code }) {
  return apiRequest('/auth/otp/verify', { method: 'POST', body: { otpId, code } });
}

export function login({ email, password }) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

export function forgotPassword({ email }) {
  return apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
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
