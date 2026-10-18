jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-application', () => ({ getInstallationTimeAsync: jest.fn() }));
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  requestReview: jest.fn(() => Promise.resolve()),
  storeUrl: jest.fn(() => 'https://play.google.com/store/apps/details?id=com.spotit.app'),
}));
const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-18T10:00:00Z').getTime();
function load(os = 'android') {
  let loaded;
  jest.isolateModules(() => {
    jest.doMock('react-native', () => ({ Platform: { OS: os }, Linking: { openURL: jest.fn(() => Promise.resolve()) } }));
    loaded = {
      rate: require('./rateApp.js'),
      StoreReview: require('expo-store-review'),
      Application: require('expo-application'),
      AsyncStorage: require('@react-native-async-storage/async-storage'),
      Linking: require('react-native').Linking,
    };
  });
  return loaded;
}
async function saveLogs(rate, n) {
  let last;
  for (let i = 0; i < n; i++) last = await rate.noteLogSaved();
  return last;
}
beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
  jest.clearAllMocks();
});
afterEach(() => {
  jest.useRealTimers();
});
describe('isRatingDue', () => {
  const { isRatingDue } = load().rate;
  const base = { installedAt: NOW - 10 * DAY, logCount: 3, asks: [] };
  it('is due once installed 7 days with 3 logs and never asked', () => {
    expect(isRatingDue(base, NOW)).toBe(true);
  });
  it('waits until the app has been installed for 7 days', () => {
    expect(isRatingDue({ ...base, installedAt: NOW - 6 * DAY }, NOW)).toBe(false);
  });
  it('waits for 3 logs', () => {
    expect(isRatingDue({ ...base, logCount: 2 }, NOW)).toBe(false);
  });
  it('waits 90 days after the last ask', () => {
    expect(isRatingDue({ ...base, asks: [NOW - 89 * DAY] }, NOW)).toBe(false);
    expect(isRatingDue({ ...base, asks: [NOW - 90 * DAY] }, NOW)).toBe(true);
  });
  it('asks at most 3 times a year', () => {
    expect(isRatingDue({ ...base, asks: [NOW - 300 * DAY, NOW - 200 * DAY, NOW - 100 * DAY] }, NOW)).toBe(false);
  });
});
describe('noteLogSaved', () => {
  it('shows the store review after the third log, after a short delay', async () => {
    const { rate, StoreReview, Application } = load();
    Application.getInstallationTimeAsync.mockResolvedValue(new Date(NOW - 10 * DAY));
    expect(await saveLogs(rate, 2)).toBe(false);
    expect(await rate.noteLogSaved()).toBe(true);
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
    jest.advanceTimersByTime(rate.RATING_DELAY_MS);
    expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
  });
  it('does not ask again straight away', async () => {
    const { rate, StoreReview, Application } = load();
    Application.getInstallationTimeAsync.mockResolvedValue(new Date(NOW - 10 * DAY));
    await saveLogs(rate, 3);
    expect(await saveLogs(rate, 5)).toBe(false);
    expect(await rate.noteLevelUp()).toBe(false);
    jest.runAllTimers();
    expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
  });
  it('does not ask a new install', async () => {
    const { rate, StoreReview, Application } = load();
    Application.getInstallationTimeAsync.mockResolvedValue(new Date(NOW - 2 * DAY));
    expect(await saveLogs(rate, 5)).toBe(false);
    jest.runAllTimers();
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
  });
  it('never opens the store when the in-app review is unavailable', async () => {
    const { rate, StoreReview, Application, Linking } = load();
    Application.getInstallationTimeAsync.mockResolvedValue(new Date(NOW - 10 * DAY));
    StoreReview.isAvailableAsync.mockResolvedValue(false);
    expect(await saveLogs(rate, 3)).toBe(false);
    jest.runAllTimers();
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
  it('does nothing on iOS for now', async () => {
    const { rate, StoreReview, Application } = load('ios');
    Application.getInstallationTimeAsync.mockResolvedValue(new Date(NOW - 10 * DAY));
    expect(rate.canRateApp).toBe(false);
    expect(await saveLogs(rate, 3)).toBe(false);
    expect(StoreReview.isAvailableAsync).not.toHaveBeenCalled();
  });
});
describe('noteLevelUp', () => {
  it('asks on a level-up once the log count is reached', async () => {
    const { rate, StoreReview, Application, AsyncStorage } = load();
    Application.getInstallationTimeAsync.mockResolvedValue(new Date(NOW - 10 * DAY));
    await AsyncStorage.setItem('spotit_rating_state', JSON.stringify({ logCount: 3, asks: [], firstSeenAt: NOW - 10 * DAY }));
    expect(await rate.noteLevelUp()).toBe(true);
    jest.runAllTimers();
    expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
  });
  it('does not count a level-up as a log', async () => {
    const { rate, Application } = load();
    Application.getInstallationTimeAsync.mockResolvedValue(new Date(NOW - 10 * DAY));
    for (let i = 0; i < 3; i++) await rate.noteLevelUp();
    expect(await rate.noteLevelUp()).toBe(false);
  });
});
describe('openStoreListing', () => {
  it('opens the Play Store page', async () => {
    const { rate, Linking } = load();
    await rate.openStoreListing();
    expect(Linking.openURL).toHaveBeenCalledWith('https://play.google.com/store/apps/details?id=com.spotit.app');
  });
});
