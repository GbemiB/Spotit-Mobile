import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer, INIT } from './reducer.js';
import { A } from './actions.js';
import { configureAuthClient } from '../api/client.js';
import { loadTokens, saveTokens, clearTokens } from '../utils/tokenStore.js';
const PERSIST_KEYS = [
  'onboarded',
  'authDone',
  'userId',
  'userName',
  'goal',
  'dob',
  'cycleLength',
  'periodLength',
  'lastPeriodDate',
  'onboardStep',
  'onboardDraft',
  'femPoints',
  'streak',
  'longestStreak',
  'lastLogDate',
  'lastClaimedDate',
  'logs',
  'notifs',
  'themePref',
  'isPremium',
  'plan',
  'renewsAt',
  'autoRenew',
  'history',
  'badges',
  'challenges',
  'shopProducts',
];
const AppCtx = createContext(null);
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const [ready, setReady] = useState(false);
  const ttRef = useRef(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  useEffect(() => {
    configureAuthClient({
      getRefreshToken: () => stateRef.current.refreshToken,
      onTokensRefreshed: ({ accessToken }) => dispatch({ type: A.TOKENS_REFRESHED, accessToken }),
      onSessionExpired: () => dispatch({ type: A.LOGOUT }),
    });
  }, []);
  useEffect(() => {
    (async () => {
      let saved = null;
      try {
        const raw = await AsyncStorage.getItem('spotit_state');
        if (raw) saved = JSON.parse(raw);
      } catch {}
      if (saved) {
        let tokens = await loadTokens();
        if (!tokens.accessToken && saved.accessToken) {
          tokens = { accessToken: saved.accessToken, refreshToken: saved.refreshToken ?? null };
          await saveTokens(tokens);
        }
        dispatch({ type: A.HYDRATE, payload: { ...saved, ...tokens } });
      } else {
        await clearTokens();
      }
      setReady(true);
    })();
  }, []);
  useEffect(() => {
    if (!ready) return;
    const data = {};
    PERSIST_KEYS.forEach(k => {
      data[k] = state[k];
    });
    AsyncStorage.setItem('spotit_state', JSON.stringify(data));
  }, [state, ready]);
  useEffect(() => {
    if (!ready) return;
    saveTokens({ accessToken: state.accessToken, refreshToken: state.refreshToken });
  }, [state.accessToken, state.refreshToken, ready]);
  useEffect(() => {
    if (state.toast) {
      clearTimeout(ttRef.current);
      ttRef.current = setTimeout(() => dispatch({ type: A.CLEAR_TOAST }), 3000);
    }
  }, [state.toast]);
  return <AppCtx.Provider value={{ state, dispatch, ready }}>{children}</AppCtx.Provider>;
}
export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
