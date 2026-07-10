import { API_BASE_URL } from './config.js';

export class ApiError extends Error {
  constructor(message, status, errorCode) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

// Every backend response — success or error — arrives as {code, message, data}.
// This unwraps that envelope: resolves to `data` on success, throws ApiError otherwise.
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

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
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'network_error');
  }

  if (!response.ok || envelope.code >= 400) {
    throw new ApiError(envelope.message || 'Something went wrong. Please try again.', envelope.code, envelope.data?.errorCode);
  }
  return envelope.data;
}
