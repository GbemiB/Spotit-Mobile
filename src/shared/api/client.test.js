import { apiRequest } from './client.js';
jest.mock('../utils/timeZone.js', () => ({ deviceTimeZone: jest.fn(() => 'Africa/Lagos') }));
const { deviceTimeZone } = require('../utils/timeZone.js');
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ code: 200, message: 'OK', data: { ok: true } }) }),
  );
});
test("every request carries the phone's time zone", async () => {
  await apiRequest('/cycle/current', { token: 'access' });
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers['X-Time-Zone']).toBe('Africa/Lagos');
  expect(options.headers.Authorization).toBe('Bearer access');
});
test('the header is left out when the time zone is unknown', async () => {
  deviceTimeZone.mockReturnValueOnce(null);
  await apiRequest('/content/feed');
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers['X-Time-Zone']).toBeUndefined();
});
