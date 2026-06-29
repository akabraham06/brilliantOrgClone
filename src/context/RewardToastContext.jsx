import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const RewardToastContext = createContext(null);

// Safe no-op fallback so grant sites can call pushReward unconditionally even
// when no provider is mounted (graceful degradation, mirroring the rest of the
// economy/AI features which no-op when off).
const FALLBACK = Object.freeze({ toasts: [], pushReward: () => {}, dismiss: () => {} });

// Keep at most this many toasts stacked at once (older ones drop off).
const MAX_TOASTS = 4;

/**
 * Lightweight, app-global reward-framing toast queue. Each toast NAMES the
 * learning behavior that earned the reward (e.g. "Recalled from memory") to keep
 * attention on learning rather than coins. Pure UI state — no Firebase, no AI.
 */
export function RewardToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const pushReward = useCallback(({ amount = 0, coins = 0, behavior = '', icon } = {}) => {
    // Skip empties (e.g. an already-granted no-op returns 0 xp / 0 coins).
    if (!behavior && amount <= 0 && coins <= 0) return;
    idRef.current += 1;
    const toast = { id: idRef.current, amount, coins, behavior, icon };
    setToasts((cur) => [...cur, toast].slice(-MAX_TOASTS));
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, pushReward, dismiss }), [toasts, pushReward, dismiss]);

  return <RewardToastContext.Provider value={value}>{children}</RewardToastContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRewardToast() {
  return useContext(RewardToastContext) || FALLBACK;
}
