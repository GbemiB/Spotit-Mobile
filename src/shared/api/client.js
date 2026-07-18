import { API_BASE_URL } from './config.js';

export class ApiError extends Error {
  constructor(message, status, errorCode) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

const SENSITIVE_KEYS = ['password', 'newPassword', 'receipt', 'pushToken', 'accessToken', 'refreshToken'];

// Every api/*.js module funnels through this one function, so logging here covers every
// call in the app without touching each module individually.
function redact(value) {
  if (!value || typeof value !== 'object') return value;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  for (const key of SENSITIVE_KEYS) {
    if (key in copy) copy[key] = '***';
  }
  return copy;
}

// This module has no React/store import of its own — AppProvider calls configureAuthClient()
// once on mount so a plain 401 handler here can read the live refresh token and update global
// auth state without a circular dependency on the store.
let authBridge = {
  getRefreshToken: () => null,
  onTokensRefreshed: () => {},
  onSessionExpired: () => {},
};

export function configureAuthClient(bridge) {
  authBridge = bridge;
}

// Every backend response — success or error — arrives as {code, message, data}.
// This unwraps that envelope: resolves to `data` on success, throws ApiError otherwise.
async function rawRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  if (__DEV__) console.log(`[api] -> ${method} ${path}`, body !== undefined ? redact(body) : '');

  let response;
  let envelope;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    envelope = await response.json();
  } catch {
    if (__DEV__) console.log(`[api] xx ${method} ${path} network_error`);
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'network_error');
  }

  if (__DEV__) console.log(`[api] <- ${method} ${path} ${response.status}`, redact(envelope));

  if (!response.ok || envelope.code >= 400) {
    throw new ApiError(envelope.message || 'Something went wrong. Please try again.', envelope.code, envelope.data?.errorCode);
  }
  return envelope.data;
}

// Concurrent 401s share one in-flight refresh instead of each firing their own
// POST /auth/refresh — they all await the same promise for the new access token.
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
    // Only retry authenticated calls that 401 — auth endpoints (login, signup, refresh itself)
    // never pass a token, so this can't recurse into refreshing off of a refresh failure.
    if (e instanceof ApiError && e.status === 401 && options.token && !_isRetry) {
      try {
        const newToken = await refreshAccessToken();
        return await apiRequest(path, { ...options, token: newToken }, true);
      } catch {
        // Refresh token is gone/expired too — nothing left to try but a fresh login.
        authBridge.onSessionExpired();
        throw e;
      }
    }
    throw e;
  }
}
