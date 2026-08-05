import { apiRequest } from './client.js';

export function getSummary(token) {
  return apiRequest('/rewards/summary', { token });
}

export function getBadges(token) {
  return apiRequest('/rewards/badges', { token });
}

export function getChallenges(token) {
  return apiRequest('/rewards/challenges', { token });
}

export function claimChallenge(id, token) {
  return apiRequest(`/rewards/challenges/${id}/claim`, { method: 'POST', token });
}

export function dailyClaim(token) {
  return apiRequest('/rewards/daily-claim', { method: 'POST', token });
}

export function watchAd({ adNetwork, adUnitId, verificationToken }, token) {
  return apiRequest('/rewards/watch-ad', { method: 'POST', body: { adNetwork, adUnitId, verificationToken }, token });
}

export function getHistory({ limit, cursor } = {}, token) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (cursor) params.set('cursor', cursor);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/rewards/history${query}`, { token });
}
