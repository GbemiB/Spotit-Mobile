import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as devicesApi from '../api/devices.js';
import {
  getPermissionState,
  requestPermission,
  syncPushRegistration,
  unlinkPush,
  tabForResponse,
  listenForReminderTaps,
  listenForReminders,
  configureNotifications,
  wasPromptSeen,
  markPromptSeen,
  deviceTimeZone,
} from './push.js';
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-constants', () => ({ expoConfig: { extra: { eas: { projectId: 'project-1' } } } }));
jest.mock('expo-notifications', () => ({
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  AndroidImportance: { HIGH: 4 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  getLastNotificationResponse: jest.fn(() => null),
  clearLastNotificationResponse: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));
jest.mock('../api/devices.js', () => ({
  registerDevice: jest.fn(() => Promise.resolve()),
  unregisterDevice: jest.fn(() => Promise.resolve()),
}));
const TOKEN = 'ExponentPushToken[abc]';
const response = screen => ({ notification: { request: { content: { data: { screen } } } } });
beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  Notifications.getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
  Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: TOKEN });
});
describe('permission state', () => {
  test('granted', async () => {
    expect(await getPermissionState()).toBe('granted');
  });
  test('not asked yet is undetermined', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
    expect(await getPermissionState()).toBe('undetermined');
  });
  test('refused for good is denied', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false });
    expect(await getPermissionState()).toBe('denied');
  });
  test('iOS provisional permission counts as granted', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true, ios: { status: 3 } });
    expect(await getPermissionState()).toBe('granted');
  });
  test('requesting returns the new state', async () => {
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
    expect(await requestPermission()).toBe('granted');
  });
});
describe('syncPushRegistration', () => {
  test('registers the Expo push token with the platform and time zone', async () => {
    expect(await syncPushRegistration('access')).toBe('granted');
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'project-1' });
    expect(devicesApi.registerDevice).toHaveBeenCalledWith(
      { pushToken: TOKEN, platform: expect.any(String), timeZone: expect.any(String) },
      'access',
    );
    expect(await AsyncStorage.getItem('spotit_push_token')).toBe(TOKEN);
  });
  test('registers nothing without permission', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
    expect(await syncPushRegistration('access')).toBe('undetermined');
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(devicesApi.registerDevice).not.toHaveBeenCalled();
  });
  test('does nothing when signed out', async () => {
    expect(await syncPushRegistration(null)).toBe('unsupported');
    expect(devicesApi.registerDevice).not.toHaveBeenCalled();
  });
  test('removes the device id that builds before 1.1 registered', async () => {
    await AsyncStorage.setItem('spotit_device_id', 'legacy-id');
    await AsyncStorage.setItem('spotit_device_registered', '1');
    await syncPushRegistration('access');
    expect(devicesApi.unregisterDevice).toHaveBeenCalledWith('legacy-id', 'access');
    expect(await AsyncStorage.getItem('spotit_device_registered')).toBeNull();
    expect(devicesApi.registerDevice).toHaveBeenCalled();
  });
  test('replaces a push token that has changed', async () => {
    await AsyncStorage.setItem('spotit_push_token', 'ExponentPushToken[old]');
    await syncPushRegistration('access');
    expect(devicesApi.unregisterDevice).toHaveBeenCalledWith('ExponentPushToken[old]', 'access');
    expect(await AsyncStorage.getItem('spotit_push_token')).toBe(TOKEN);
  });
  test('a failure to get a token or reach the server is swallowed', async () => {
    Notifications.getExpoPushTokenAsync.mockRejectedValue(new Error('offline'));
    expect(await syncPushRegistration('access')).toBe('granted');
    devicesApi.registerDevice.mockRejectedValueOnce(new Error('500'));
    Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: TOKEN });
    expect(await syncPushRegistration('access')).toBe('granted');
    expect(await AsyncStorage.getItem('spotit_push_token')).toBeNull();
  });
});
describe('unlinkPush', () => {
  test('unregisters the stored token and forgets it', async () => {
    await AsyncStorage.setItem('spotit_push_token', TOKEN);
    await unlinkPush('access');
    expect(devicesApi.unregisterDevice).toHaveBeenCalledWith(TOKEN, 'access');
    expect(await AsyncStorage.getItem('spotit_push_token')).toBeNull();
  });
  test('still forgets the token when the server cannot be reached', async () => {
    await AsyncStorage.setItem('spotit_push_token', TOKEN);
    devicesApi.unregisterDevice.mockRejectedValueOnce(new Error('offline'));
    await unlinkPush('access');
    expect(await AsyncStorage.getItem('spotit_push_token')).toBeNull();
  });
});
describe('reminder taps', () => {
  test('the server screen names map to the app tabs', () => {
    expect(tabForResponse(response('home'))).toBe('home');
    expect(tabForResponse(response('calendar'))).toBe('cal');
    expect(tabForResponse(response('insights'))).toBe('insights');
    expect(tabForResponse(response('somewhere-else'))).toBeNull();
    expect(tabForResponse(null)).toBeNull();
  });
  test('a reminder that launched the app opens its tab once', () => {
    Notifications.getLastNotificationResponse.mockReturnValueOnce(response('calendar'));
    const onOpen = jest.fn();
    listenForReminderTaps(onOpen);
    expect(onOpen).toHaveBeenCalledWith('cal');
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalled();
  });
  test('a reminder tapped while the app runs opens its tab, and the listener is removed on cleanup', () => {
    const remove = jest.fn();
    Notifications.addNotificationResponseReceivedListener.mockReturnValueOnce({ remove });
    const onOpen = jest.fn();
    const stop = listenForReminderTaps(onOpen);
    Notifications.addNotificationResponseReceivedListener.mock.calls[0][0](response('insights'));
    expect(onOpen).toHaveBeenCalledWith('insights');
    stop();
    expect(remove).toHaveBeenCalled();
  });
});
describe('more registration cases', () => {
  test('an unchanged push token is registered again without unregistering it', async () => {
    await AsyncStorage.setItem('spotit_push_token', TOKEN);
    await syncPushRegistration('access');
    expect(devicesApi.unregisterDevice).not.toHaveBeenCalled();
    expect(devicesApi.registerDevice).toHaveBeenCalledTimes(1);
  });
  test('a failed unregister of an old token does not stop the new one being registered', async () => {
    await AsyncStorage.setItem('spotit_push_token', 'ExponentPushToken[old]');
    devicesApi.unregisterDevice.mockRejectedValueOnce(new Error('offline'));
    await syncPushRegistration('access');
    expect(devicesApi.registerDevice).toHaveBeenCalledWith(expect.objectContaining({ pushToken: TOKEN }), 'access');
    expect(await AsyncStorage.getItem('spotit_push_token')).toBe(TOKEN);
  });
  test('a failed registration does not store the token, so the next launch tries again', async () => {
    devicesApi.registerDevice.mockRejectedValueOnce(new Error('500'));
    await expect(syncPushRegistration('access')).resolves.toBe('granted');
    expect(await AsyncStorage.getItem('spotit_push_token')).toBeNull();
  });
  test('a refused permission is reported so the app can point to the phone settings', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false });
    await expect(syncPushRegistration('access')).resolves.toBe('denied');
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });
  test('a permission check that throws is treated as unsupported', async () => {
    Notifications.getPermissionsAsync.mockRejectedValueOnce(new Error('native module missing'));
    await expect(getPermissionState()).resolves.toBe('unsupported');
  });
  test('the push token is requested for the EAS project', async () => {
    await syncPushRegistration('access');
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'project-1' });
  });
});
describe('notification display and listeners', () => {
  test('a reminder arriving while the app is open is shown with sound', async () => {
    configureNotifications();
    const { handleNotification } = Notifications.setNotificationHandler.mock.calls[0][0];
    await expect(handleNotification()).resolves.toEqual(expect.objectContaining({ shouldShowBanner: true, shouldPlaySound: true }));
  });
  test('a reminder received in the foreground refreshes the bell, and the listener is removed on cleanup', () => {
    const remove = jest.fn();
    Notifications.addNotificationReceivedListener.mockReturnValueOnce({ remove });
    const onReceived = jest.fn();
    const stop = listenForReminders(onReceived);
    Notifications.addNotificationReceivedListener.mock.calls[0][0]({});
    expect(onReceived).toHaveBeenCalledTimes(1);
    stop();
    expect(remove).toHaveBeenCalled();
  });
  test('a tap on a notification that is not a reminder opens nothing', () => {
    const onOpen = jest.fn();
    listenForReminderTaps(onOpen);
    Notifications.addNotificationResponseReceivedListener.mock.calls[0][0](response(undefined));
    expect(onOpen).not.toHaveBeenCalled();
    expect(Notifications.clearLastNotificationResponse).not.toHaveBeenCalled();
  });
});
describe('permission prompt flag', () => {
  test('is not seen until marked', async () => {
    expect(await wasPromptSeen()).toBe(false);
    await markPromptSeen();
    expect(await wasPromptSeen()).toBe(true);
  });
});
test('the time zone comes from the phone', () => {
  expect(deviceTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
});
