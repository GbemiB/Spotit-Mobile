import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer, INIT } from './reducer.js';
import { A } from './actions.js';
import { configureAuthClient } from '../api/client.js';

const PERSIST_KEYS = [
  'onboarded',
  'authDone',
  'accessToken',
  'refreshToken',
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
  stateRef.current = state;

  // Wire client.js's 401 handler to live auth state — it's a plain module outside React, so it
  // can't read state/dispatch directly. Registered once; the closures below always read the
  // latest state via stateRef instead of capturing this render's state.
  useEffect(() => {
    configureAuthClient({
      getRefreshToken: () => stateRef.current.refreshToken,
      onTokensRefreshed: ({ accessToken }) => dispatch({ type: A.TOKENS_REFRESHED, accessToken }),
      onSessionExpired: () => dispatch({ type: A.LOGOUT }),
    });
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem('spotit_state').then(raw => {
      if (raw) {
        try {
          dispatch({ type: A.HYDRATE, payload: JSON.parse(raw) });
        } catch {}
      }
      setReady(true);
    });
  }, []);

  // Persist on change
  useEffect(() => {
    if (!ready) return;
    const data = {};
    PERSIST_KEYS.forEach(k => {
      data[k] = state[k];
    });
    AsyncStorage.setItem('spotit_state', JSON.stringify(data));
  }, [state, ready]);

  // Auto-clear toasts
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
