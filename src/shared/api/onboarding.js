import { apiRequest } from './client.js';

export function getTemplate(token) {
  return apiRequest('/onboarding/template', { token });
}

export function completeOnboarding({ dob, lastPeriodDate, goal, cycleLength, periodLength }, token) {
  return apiRequest('/onboarding/complete', {
    method: 'POST',
    body: { dob, lastPeriodDate: lastPeriodDate || null, goal, cycleLength, periodLength },
    token,
  });
}
