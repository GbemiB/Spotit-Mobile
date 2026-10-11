import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTokens, saveTokens, clearTokens } from './tokenStore.js';

jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    AFTER_FIRST_UNLOCK: 1,
    getItemAsync: jest.fn(async key => store[key] ?? null),
    setItemAsync: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    deleteItemAsync: jest.fn(async key => {
      delete store[key];
    }),
  };
});
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('tokenStore', () => {
  it('round-trips both tokens through the secure store', async () => {
    await saveTokens({ accessToken: 'a.jwt.token', refreshToken: 'a.refresh.token' });
    expect(await loadTokens()).toEqual({ accessToken: 'a.jwt.token', refreshToken: 'a.refresh.token' });
  });
  it('never writes tokens to AsyncStorage on a device', async () => {
    await saveTokens({ accessToken: 'a.jwt.token', refreshToken: 'a.refresh.token' });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
  it('deletes a token that is saved as null', async () => {
    await saveTokens({ accessToken: 'a.jwt.token', refreshToken: 'a.refresh.token' });
    await saveTokens({ accessToken: 'a.jwt.token', refreshToken: null });
    expect(await loadTokens()).toEqual({ accessToken: 'a.jwt.token', refreshToken: null });
  });
  it('clears both tokens on sign-out', async () => {
    await saveTokens({ accessToken: 'a.jwt.token', refreshToken: 'a.refresh.token' });
    await clearTokens();
    expect(await loadTokens()).toEqual({ accessToken: null, refreshToken: null });
  });
  it('treats an unreadable keychain as signed out instead of throwing', async () => {
    SecureStore.getItemAsync.mockRejectedValueOnce(new Error('keychain locked'));
    SecureStore.getItemAsync.mockRejectedValueOnce(new Error('keychain locked'));
    expect(await loadTokens()).toEqual({ accessToken: null, refreshToken: null });
  });
});
