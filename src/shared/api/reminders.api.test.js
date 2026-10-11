import { apiRequest } from './client.js';
import { registerDevice, unregisterDevice } from './devices.js';
import { getInbox, markInboxRead, updateNotifications, getNotifications } from './users.js';
jest.mock('./client.js', () => ({ apiRequest: jest.fn(() => Promise.resolve({})) }));
beforeEach(() => jest.clearAllMocks());
test('registering a device sends the push token, platform and time zone', () => {
  registerDevice({ pushToken: 'ExponentPushToken[a]', platform: 'ios', timeZone: 'Africa/Lagos' }, 'access');
  expect(apiRequest).toHaveBeenCalledWith('/devices/register', {
    method: 'POST',
    body: { pushToken: 'ExponentPushToken[a]', platform: 'ios', timeZone: 'Africa/Lagos' },
    token: 'access',
  });
});
test('unregistering escapes the brackets in the push token', () => {
  unregisterDevice('ExponentPushToken[a b]', 'access');
  expect(apiRequest).toHaveBeenCalledWith('/devices/ExponentPushToken%5Ba%20b%5D', { method: 'DELETE', token: 'access' });
});
test('preferences are read from and patched to the user resource, sending only what changed', () => {
  getNotifications('access');
  updateNotifications({ ovulation: false, periodDaysBefore: [2, 0] }, 'access');
  expect(apiRequest).toHaveBeenNthCalledWith(1, '/users/me/notifications', { token: 'access' });
  expect(apiRequest).toHaveBeenNthCalledWith(2, '/users/me/notifications', {
    method: 'PATCH',
    body: { ovulation: false, periodDaysBefore: [2, 0] },
    token: 'access',
  });
});
test('the inbox is fetched and marked read', () => {
  getInbox('access');
  markInboxRead('access');
  expect(apiRequest).toHaveBeenNthCalledWith(1, '/notifications', { token: 'access' });
  expect(apiRequest).toHaveBeenNthCalledWith(2, '/notifications/read', { method: 'POST', token: 'access' });
});
