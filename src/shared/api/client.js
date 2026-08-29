import { API_BASE_URL } from './config.js';
export class ApiError extends Error {
  constructor(message, status, errorCode, otpId) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.otpId = otpId;
  }
}
const SENSITIVE_KEYS = ['password', 'newPassword', 'receipt', 'pushToken', 'accessToken', 'refreshToken'];
const REQUEST_TIMEOUT_MS = 15000;
function redact(value) {
  if (!value || typeof value !== 'object') return value;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  for (const key of SENSITIVE_KEYS) {
    if (key in copy) copy[key] = '***';
  }
  return copy;
}
let authBridge = { getRefreshToken: () => null, onTokensRefreshed: () => {}, onSessionExpired: () => {} };
export function configureAuthClient(bridge) {
  authBridge = bridge;
}
async function rawRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (__DEV__) console.log(`[api] -> ${method} ${path}`, body !== undefined ? redact(body) : '');
  let response;
  let envelope;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    envelope = await response.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      if (__DEV__) console.log(`[api] xx ${method} ${path} timeout`);
      throw new ApiError('That took too long. Please check your connection and try again.', 0, 'timeout');
    }
    if (__DEV__) console.log(`[api] xx ${method} ${path} network_error`);
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'network_error');
  } finally {
    clearTimeout(timeout);
  }
  if (__DEV__) console.log(`[api] <- ${method} ${path} ${response.status}`, redact(envelope));
  if (!response.ok || envelope.code >= 400) {
    throw new ApiError(
      envelope.message || 'Something went wrong. Please try again.',
      envelope.code,
      envelope.data?.errorCode,
      envelope.data?.otpId,
    );
  }
  return envelope.data;
}
let refreshPromise = null;
function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const currentRefreshToken = authBridge.getRefreshToken();
      if (!currentRefreshToken) {
        throw new ApiError('Session expired.', 401, 'session_expired');
      }
      const data = await rawRequest('/auth/refresh', { method: 'POST', body: { refreshToken: currentRefreshToken } });
      authBridge.onTokensRefreshed(data);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
export async function apiRequest(path, options = {}, _isRetry = false) {
  try {
    return await rawRequest(path, options);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && options.token && !_isRetry) {
      try {
        const newToken = await refreshAccessToken();
        return await apiRequest(path, { ...options, token: newToken }, true);
      } catch {
        authBridge.onSessionExpired();
        throw e;
      }
    }
    throw e;
  }
}
