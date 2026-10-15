import { requiredUpdate } from './appVersion.js';
jest.mock('expo-application', () => ({ nativeBuildVersion: '7' }));
jest.mock('expo-constants', () => ({ executionEnvironment: 'standalone' }));
const policy = {
  android: { minBuild: 10, storeUrl: 'https://play.google.com/store/apps/details?id=com.spotit.app' },
  ios: { minBuild: 0, storeUrl: null },
};
describe('requiredUpdate', () => {
  test('asks an older build to update and gives the store page', () => {
    expect(requiredUpdate(policy, 7, 'android')).toEqual({ storeUrl: 'https://play.google.com/store/apps/details?id=com.spotit.app' });
  });
  test('lets the minimum build and newer builds through', () => {
    expect(requiredUpdate(policy, 10, 'android')).toBeNull();
    expect(requiredUpdate(policy, 11, 'android')).toBeNull();
  });
  test('a minimum of 0 turns the check off', () => {
    expect(requiredUpdate(policy, 1, 'ios')).toBeNull();
  });
  test('an unknown build or missing policy never blocks', () => {
    expect(requiredUpdate(policy, null, 'android')).toBeNull();
    expect(requiredUpdate(null, 7, 'android')).toBeNull();
    expect(requiredUpdate({}, 7, 'android')).toBeNull();
  });
  test('no store page still blocks, without a link', () => {
    expect(requiredUpdate({ ios: { minBuild: 5, storeUrl: null } }, 4, 'ios')).toEqual({ storeUrl: null });
  });
});
