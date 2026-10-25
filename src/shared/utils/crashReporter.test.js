import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportCrash } from '../api/app.js';
import { crashFrom, queueCrash, flushCrashes, setCrashContext, installCrashReporter } from './crashReporter.js';
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../api/app.js', () => ({ reportCrash: jest.fn() }));
jest.mock('expo-application', () => ({ nativeApplicationVersion: '1.1.0', nativeBuildVersion: '7' }));
beforeEach(async () => {
  await AsyncStorage.clear();
  reportCrash.mockReset();
  setCrashContext({ screen: null, token: null });
});
test('a crash carries the screen, version and phone', () => {
  setCrashContext({ screen: 'calendar' });
  const crash = crashFrom(new Error('x is undefined'));
  expect(crash.message).toBe('x is undefined');
  expect(crash.screen).toBe('calendar');
  expect(crash.appVersion).toBe('1.1.0 (7)');
  expect(crash.platform).toBeTruthy();
  expect(crash.stack).toContain('x is undefined');
});
test('a thrown string still makes a crash', () => {
  expect(crashFrom('boom').message).toBe('boom');
  expect(crashFrom(null).message).toBe('Unknown error');
});
test('queued crashes are sent with the token and cleared', async () => {
  setCrashContext({ token: 'access' });
  reportCrash.mockResolvedValue({});
  await queueCrash(crashFrom(new Error('one')));
  await queueCrash(crashFrom(new Error('two')));
  expect(await flushCrashes()).toBe(2);
  expect(reportCrash).toHaveBeenCalledWith(expect.objectContaining({ message: 'one' }), 'access');
  expect(await flushCrashes()).toBe(0);
});
test('a crash that cannot be sent waits for next time', async () => {
  reportCrash.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({});
  await queueCrash(crashFrom(new Error('offline crash')));
  expect(await flushCrashes()).toBe(0);
  expect(await flushCrashes()).toBe(1);
});
test('only the last 10 crashes are kept', async () => {
  for (let i = 0; i < 12; i += 1) await queueCrash(crashFrom(new Error(`c${i}`)));
  reportCrash.mockResolvedValue({});
  expect(await flushCrashes()).toBe(10);
  expect(reportCrash).toHaveBeenCalledWith(expect.objectContaining({ message: 'c11' }), null);
});
test('the global handler queues the crash and still calls the previous handler', async () => {
  const previous = jest.fn();
  let handler;
  global.ErrorUtils = { getGlobalHandler: () => previous, setGlobalHandler: h => (handler = h) };
  installCrashReporter();
  reportCrash.mockResolvedValue({});
  handler(new Error('fatal'), true);
  expect(previous).toHaveBeenCalledWith(expect.any(Error), true);
  await new Promise(r => setTimeout(r, 0));
  await flushCrashes();
  expect(reportCrash).toHaveBeenCalledWith(expect.objectContaining({ message: 'fatal' }), null);
});
