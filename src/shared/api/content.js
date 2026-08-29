import { apiRequest } from './client.js';
export function getFeed(limit, token) {
  const query = limit ? `?limit=${limit}` : '';
  return apiRequest(`/content/feed${query}`, { token });
}
