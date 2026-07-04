import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer, INIT } from './reducer.js';
import { A } from './actions.js';

const PERSIST_KEYS = [
  'onboarded','authDone','userName','goal','cycleLength','periodLength','lastPeriodDate',
  'femPoints','streak','longestStreak','lastLogDate','lastClaimedDate','logs','notifications',
];

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const [ready, setReady] = useState(false);
  const ttRef = useRef(null);

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
    PERSIST_KEYS.forEach(k => { data[k] = state[k]; });
    AsyncStorage.setItem('spotit_state', JSON.stringify(data));
  }, [state, ready]);

  // Auto-clear toasts
  useEffect(() => {
    if (state.toast) {
      clearTimeout(ttRef.current);
      ttRef.current = setTimeout(() => dispatch({ type: A.CLEAR_TOAST }), 3000);
    }
  }, [state.toast]);

  return (
    <AppCtx.Provider value={{ state, dispatch, ready }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
