import { apiRequest } from './client.js';
import {
  getPartnerStatus,
  invitePartner,
  resendPartnerInvite,
  cancelPartnerInvite,
  updatePartnerSettings,
  acceptPartnerInvite,
  getPartnerProfile,
  getPartnerCheckIn,
  partnerCheckIn,
  getPartnerLove,
  stopPartnerSharing,
} from './partner.js';
jest.mock('./client.js', () => ({ apiRequest: jest.fn(() => Promise.resolve({})) }));
beforeEach(() => jest.clearAllMocks());
test('the status is read from the partner resource', () => {
  getPartnerStatus('access');
  expect(apiRequest).toHaveBeenCalledWith('/partner/status', { token: 'access' });
});
test('an invite sends only the email', () => {
  invitePartner('tunde@email.com', 'access');
  expect(apiRequest).toHaveBeenCalledWith('/partner/invite', { method: 'POST', body: { email: 'tunde@email.com' }, token: 'access' });
});
test('resend and cancel act on the pending invite', () => {
  resendPartnerInvite('access');
  cancelPartnerInvite('access');
  expect(apiRequest).toHaveBeenNthCalledWith(1, '/partner/invite/resend', { method: 'POST', token: 'access' });
  expect(apiRequest).toHaveBeenNthCalledWith(2, '/partner/invite', { method: 'DELETE', token: 'access' });
});
test('the sharing switch patches the settings', () => {
  updatePartnerSettings({ shareMoodSymptoms: false }, 'access');
  expect(apiRequest).toHaveBeenCalledWith('/partner/settings', { method: 'PATCH', body: { shareMoodSymptoms: false }, token: 'access' });
});
test('stop sharing deletes the link', () => {
  stopPartnerSharing('access');
  expect(apiRequest).toHaveBeenCalledWith('/partner', { method: 'DELETE', token: 'access' });
});
test('accepting sends the code and the name he calls her', () => {
  acceptPartnerInvite({ code: 'K7P2QX', nickname: 'Amaka' }, 'access');
  expect(apiRequest).toHaveBeenCalledWith('/partner/accept', {
    method: 'POST',
    body: { code: 'K7P2QX', nickname: 'Amaka' },
    token: 'access',
  });
});
test('his app reads her profile and his check-in', () => {
  getPartnerProfile('access');
  getPartnerCheckIn('access');
  partnerCheckIn({ kind: 'promise', supports: ['snacks'], note: 'Proud of you' }, 'access');
  getPartnerLove({ from: '2026-10-01', to: '2026-10-31' }, 'access');
  expect(apiRequest).toHaveBeenNthCalledWith(1, '/partner/profile', { token: 'access' });
  expect(apiRequest).toHaveBeenNthCalledWith(2, '/partner/check-in', { token: 'access' });
  expect(apiRequest).toHaveBeenNthCalledWith(3, '/partner/check-in', {
    method: 'POST',
    body: { kind: 'promise', supports: ['snacks'], note: 'Proud of you', expression: null },
    token: 'access',
  });
  expect(apiRequest).toHaveBeenNthCalledWith(4, '/partner/love?from=2026-10-01&to=2026-10-31', { token: 'access' });
});
