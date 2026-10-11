jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-constants', () => ({ expoConfig: { extra: { eas: { projectId: 'project-1' } } } }));
jest.mock('expo-notifications', () => ({
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  AndroidImportance: { HIGH: 4 },
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, canAskAgain: true })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[android]' })),
}));
jest.mock('../api/devices.js', () => ({
  registerDevice: jest.fn(() => Promise.resolve()),
  unregisterDevice: jest.fn(() => Promise.resolve()),
}));
// push.js reads the platform when it loads, so each test loads a fresh copy after setting it.
function loadPushOn(os) {
  let loaded;
  jest.isolateModules(() => {
    jest.doMock('react-native', () => ({ Platform: { OS: os } }));
    loaded = {
      push: require('./push.js'),
      Notifications: require('expo-notifications'),
      devicesApi: require('../api/devices.js'),
    };
  });
  return loaded;
}
afterEach(() => jest.clearAllMocks());
test('Android creates the reminders channel before asking, as Android 13 requires', async () => {
  const { push, Notifications } = loadPushOn('android');
  await expect(push.requestPermission()).resolves.toBe('granted');
  expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('reminders', expect.objectContaining({ importance: 4 }));
  const channelOrder = Notifications.setNotificationChannelAsync.mock.invocationCallOrder[0];
  expect(channelOrder).toBeLessThan(Notifications.requestPermissionsAsync.mock.invocationCallOrder[0]);
});
test('Android registers with its own platform name', async () => {
  const { push, devicesApi } = loadPushOn('android');
  await push.syncPushRegistration('access');
  expect(devicesApi.registerDevice).toHaveBeenCalledWith(
    expect.objectContaining({ pushToken: 'ExponentPushToken[android]', platform: 'android' }),
    'access',
  );
});
test('the channel id matches the one the server sends', () => {
  const { push } = loadPushOn('android');
  expect(push.REMINDER_CHANNEL).toBe('reminders');
});
test('iOS never creates an Android channel', async () => {
  const { push, Notifications } = loadPushOn('ios');
  await push.requestPermission();
  expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
});
test('the web build does nothing with notifications', async () => {
  const { push, Notifications, devicesApi } = loadPushOn('web');
  await expect(push.getPermissionState()).resolves.toBe('unsupported');
  await expect(push.syncPushRegistration('access')).resolves.toBe('unsupported');
  expect(push.listenForReminders(jest.fn())).toEqual(expect.any(Function));
  expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
  expect(devicesApi.registerDevice).not.toHaveBeenCalled();
});
