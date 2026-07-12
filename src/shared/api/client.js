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

// Every backend response — success or error — arrives as {code, message, data}.
// This unwraps that envelope: resolves to `data` on success, throws ApiError otherwise.
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
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
