import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext.jsx';
import { fetchEconomy, saveEconomy } from '../firebase/economy.js';
import {
  EMPTY_ECONOMY,
  levelForXp,
  levelProgress,
  coinsForLevelSpan,
  dailyCoinRunLimit,
  economyDayKey,
} from '../data/economy.js';
import {
  hydrateDailyQuests,
  emptyDailyQuests,
  questDayKey,
  cappedReward,
} from '../data/dailyQuests.js';
import { getCosmeticById, CATALOG } from '../data/cosmetics.js';
import { featuredPrice } from '../data/storeRotation.js';

const EconomyContext = createContext(null);

/** Normalizes any persisted economy blob into the full, safe shape. */
function hydrateEconomy(raw) {
  const e = { ...EMPTY_ECONOMY, ...(raw || {}) };
  e.xp = Math.max(0, Number(e.xp) || 0);
  e.coins = Math.max(0, Number(e.coins) || 0);
  e.ownedCosmetics = Array.isArray(e.ownedCosmetics) ? [...e.ownedCosmetics] : [];
  e.equipped = e.equipped && typeof e.equipped === 'object' ? { ...e.equipped } : {};
  e.grantedKeys = Array.isArray(e.grantedKeys) ? [...e.grantedKeys] : [];
  e.heatCheck = {
    day: economyDayKey(),
    coinRunsUsed: 0,
    bestXp: 0,
    ...(e.heatCheck || {}),
  };
  e.dailyQuests = hydrateDailyQuests(e.dailyQuests);
  // Level is derived from XP — never trust a stored value.
  e.level = levelForXp(e.xp);
  return e;
}

/**
 * Account-level economy provider (XP, coins, levels, cosmetics). Hydrates from
 * users/{uid}.economy on auth and writes back with a 700ms debounce, mirroring
 * ProgressContext. All mutations go through `mutate`, which also recomputes the
 * level and pays out level-up coin bonuses automatically.
 */
export function EconomyProvider({ children }) {
  const { user } = useAuth();

  const [economy, setEconomy] = useState(EMPTY_ECONOMY);
  const [loading, setLoading] = useState(true);
  const hydratedRef = useRef(false);
  const dirtyRef = useRef(false);
  const saveTimer = useRef(null);
  // Mirror of the latest state so action helpers can compute + return results
  // synchronously (e.g. so reward UIs know exactly what was just granted).
  const economyRef = useRef(EMPTY_ECONOMY);
  economyRef.current = economy;

  useEffect(() => {
    let active = true;
    if (!user) {
      setEconomy(EMPTY_ECONOMY);
      setLoading(false);
      hydratedRef.current = false;
      return undefined;
    }
    setLoading(true);
    hydratedRef.current = false;
    fetchEconomy(user.uid)
      .then((data) => {
        if (!active) return;
        setEconomy(hydrateEconomy(data));
      })
      .catch((err) => {
        console.error('[economy] failed to load:', err);
        if (active) setEconomy(hydrateEconomy(null));
      })
      .finally(() => {
        if (!active) return;
        hydratedRef.current = true;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!hydratedRef.current || !dirtyRef.current || !user) return undefined;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      dirtyRef.current = false;
      saveEconomy(user.uid, economyRef.current).catch((err) =>
        console.error('[economy] save failed:', err),
      );
    }, 700);
    return () => saveTimer.current && window.clearTimeout(saveTimer.current);
  }, [economy, user]);

  const mutate = useCallback((updater) => {
    dirtyRef.current = true;
    setEconomy((prev) => {
      const next = updater(prev);
      economyRef.current = next;
      return next;
    });
  }, []);

  /** Adds xp+coins, recomputes level, and pays level-up coin bonuses. Pure. */
  function applyXpCoins(prev, addXp, addCoins) {
    const fromLevel = levelForXp(prev.xp);
    const xp = Math.max(0, prev.xp + (addXp || 0));
    const toLevel = levelForXp(xp);
    const levelUpCoins = toLevel > fromLevel ? coinsForLevelSpan(fromLevel, toLevel) : 0;
    const coins = Math.max(0, prev.coins + (addCoins || 0) + levelUpCoins);
    return { next: { ...prev, xp, coins, level: toLevel }, fromLevel, toLevel, levelUpCoins };
  }

  /**
   * Idempotent reward grant. Awards xp+coins exactly once per `key`. Returns a
   * synchronous result for reward UIs: { granted, xp, coins, levelUpCoins,
   * fromLevel, toLevel, leveledUp }. A no-op (already granted) returns granted:false.
   */
  const grant = useCallback(
    ({ key, xp = 0, coins = 0 }) => {
      const cur = economyRef.current;
      if (!key || cur.grantedKeys.includes(key)) {
        return { granted: false, xp: 0, coins: 0, levelUpCoins: 0, leveledUp: false };
      }
      const { next, fromLevel, toLevel, levelUpCoins } = applyXpCoins(cur, xp, coins);
      const result = {
        granted: true,
        xp,
        coins: coins + levelUpCoins,
        levelUpCoins,
        fromLevel,
        toLevel,
        leveledUp: toLevel > fromLevel,
      };
      mutate(() => ({ ...next, grantedKeys: [...cur.grantedKeys, key] }));
      return result;
    },
    [mutate],
  );

  /** True if a grant key has already been awarded (so callers can skip work). */
  const hasGranted = useCallback((key) => economyRef.current.grantedKeys.includes(key), []);

  /**
   * Records one Heat Check run. XP is always awarded; coins only while under the
   * level-scaled daily coin-run cap. Returns what was actually awarded plus the
   * remaining coin-runs for the day. NOT idempotent — every run counts.
   */
  const recordHeatRun = useCallback(
    ({ xp = 0, baseCoins = 0 } = {}) => {
      const cur = economyRef.current;
      const today = economyDayKey();
      const hc =
        cur.heatCheck.day === today
          ? cur.heatCheck
          : { day: today, coinRunsUsed: 0, bestXp: 0 };
      const limit = dailyCoinRunLimit(levelForXp(cur.xp));
      const coinsAllowed = hc.coinRunsUsed < limit;
      const coinsAwarded = coinsAllowed ? Math.max(0, Math.round(baseCoins)) : 0;

      const { next, fromLevel, toLevel, levelUpCoins } = applyXpCoins(cur, xp, coinsAwarded);
      const nextHc = {
        day: today,
        coinRunsUsed: coinsAllowed ? hc.coinRunsUsed + 1 : hc.coinRunsUsed,
        bestXp: Math.max(hc.bestXp || 0, xp),
      };
      mutate(() => ({ ...next, heatCheck: nextHc }));
      return {
        xp,
        coins: coinsAwarded + levelUpCoins,
        coinsBlocked: !coinsAllowed,
        leveledUp: toLevel > fromLevel,
        toLevel,
        runsLeft: Math.max(0, limit - nextHc.coinRunsUsed),
        dailyLimit: limit,
      };
    },
    [mutate],
  );

  /**
   * Applies a Heat Check relative-performance bonus (leaderboard standing) on top
   * of a run. Unlike recordHeatRun this does NOT consume a coin-run or touch
   * bestXp — the caller has already recorded the run and pre-gated the coin half
   * on that run's daily-cap result (passing 0 coins when the run was capped), so
   * this just adds the small xp/coins and pays any level-up bonus. NOT idempotent
   * (every run can earn it); kept tiny + capped by the HEAT_RANK_BONUS table.
   * Returns { xp, coins, leveledUp, toLevel }.
   */
  const recordHeatBonus = useCallback(
    ({ xp = 0, coins = 0 } = {}) => {
      const cur = economyRef.current;
      const safeXp = Math.max(0, Math.round(xp) || 0);
      const safeCoins = Math.max(0, Math.round(coins) || 0);
      if (safeXp <= 0 && safeCoins <= 0) {
        return { xp: 0, coins: 0, leveledUp: false, toLevel: levelForXp(cur.xp) };
      }
      const { next, fromLevel, toLevel, levelUpCoins } = applyXpCoins(cur, safeXp, safeCoins);
      mutate(() => next);
      return {
        xp: safeXp,
        coins: safeCoins + levelUpCoins,
        leveledUp: toLevel > fromLevel,
        toLevel,
      };
    },
    [mutate],
  );

  /**
   * Replaces today's daily-quest blob (the orchestration of generation +
   * progress lives in DailyQuestsContext; this is the persisted store). Resets
   * the per-day claim tally whenever the day key rolls over.
   */
  const setDailyQuests = useCallback(
    (blob) => {
      if (!blob) return;
      mutate((prev) => ({ ...prev, dailyQuests: { ...emptyDailyQuests(blob.day), ...blob } }));
    },
    [mutate],
  );

  /**
   * Idempotent, cap-clamped quest reward claim. Pays out at most the remaining
   * daily headroom (diminishing returns past DAILY_QUEST_CAP) and records the
   * grant key `quest:<day>:<questId>` so a quest can't be re-farmed within the
   * day or across days. Returns { granted, xp, coins, leveledUp, toLevel }.
   */
  const claimQuest = useCallback(
    (quest) => {
      const cur = economyRef.current;
      const today = questDayKey();
      const blob =
        cur.dailyQuests.day === today ? cur.dailyQuests : emptyDailyQuests(today);
      const key = `quest:${today}:${quest?.id}`;
      const noop = { granted: false, xp: 0, coins: 0, leveledUp: false };
      if (!quest?.id || cur.grantedKeys.includes(key) || blob.claimed.includes(quest.id)) {
        return noop;
      }
      const { xp, coins } = cappedReward(quest, blob);
      const { next, fromLevel, toLevel, levelUpCoins } = applyXpCoins(cur, xp, coins);
      const nextBlob = {
        ...blob,
        claimed: [...blob.claimed, quest.id],
        claimedXp: (blob.claimedXp || 0) + xp,
        claimedCoins: (blob.claimedCoins || 0) + coins,
      };
      mutate(() => ({
        ...next,
        grantedKeys: [...cur.grantedKeys, key],
        dailyQuests: nextBlob,
      }));
      return {
        granted: true,
        xp,
        coins: coins + levelUpCoins,
        leveledUp: toLevel > fromLevel,
        toLevel,
      };
    },
    [mutate],
  );

  /**
   * Buys a cosmetic: validates the item exists, the level gate is met, it isn't
   * already owned, and the player can afford it. Charges today's `featuredPrice`
   * (the featured discount) so the UI and this always agree. Returns { ok, reason }.
   */
  const buy = useCallback(
    (itemId) => {
      const cur = economyRef.current;
      const item = getCosmeticById(itemId);
      if (!item) return { ok: false, reason: 'unknown' };
      if (item.exclusive) return { ok: false, reason: 'exclusive' };
      if (cur.ownedCosmetics.includes(itemId)) return { ok: false, reason: 'owned' };
      if (levelForXp(cur.xp) < item.unlockLevel) return { ok: false, reason: 'locked' };
      const price = featuredPrice(item);
      if (cur.coins < price) return { ok: false, reason: 'insufficient' };

      // Mastery exclusive: "completionist" earned when this purchase completes
      // the purchasable catalog (every CATALOG id owned). Granted atomically with
      // the buy and idempotently via grantedKeys. Returned so the Store (which is
      // inside the toast provider) can celebrate it.
      const ownedAfter = [...cur.ownedCosmetics, itemId];
      const completionId = 'completionist';
      const completionKey = `cosmetic:${completionId}`;
      const completionItem = getCosmeticById(completionId);
      const grantCompletion =
        !!completionItem &&
        !cur.grantedKeys.includes(completionKey) &&
        CATALOG.every((c) => ownedAfter.includes(c.id));

      mutate((prev) => {
        const owned = prev.ownedCosmetics.includes(itemId)
          ? prev.ownedCosmetics
          : [...prev.ownedCosmetics, itemId];
        // Auto-equip the freshly bought item for instant gratification.
        const equipped = { ...prev.equipped, [item.slot]: itemId };
        let ownedCosmetics = owned;
        let grantedKeys = prev.grantedKeys;
        if (grantCompletion) {
          ownedCosmetics = owned.includes(completionId) ? owned : [...owned, completionId];
          equipped[completionItem.slot] = completionId;
          grantedKeys = prev.grantedKeys.includes(completionKey)
            ? prev.grantedKeys
            : [...prev.grantedKeys, completionKey];
        }
        return {
          ...prev,
          coins: Math.max(0, prev.coins - price),
          ownedCosmetics,
          equipped,
          grantedKeys,
        };
      });
      return { ok: true, masteryGranted: grantCompletion ? completionItem : null };
    },
    [mutate],
  );

  /**
   * Grants an EARNED (mastery) cosmetic with no coin cost, exactly once per
   * `key` (idempotent via grantedKeys, key like `cosmetic:<id>`). Adds it to
   * ownedCosmetics and auto-equips it. Returns { granted, item } so reward UIs
   * can celebrate. A no-op (already granted / unknown id) returns granted:false.
   */
  const grantCosmetic = useCallback(
    (itemId, key) => {
      const cur = economyRef.current;
      const k = key || `cosmetic:${itemId}`;
      const item = getCosmeticById(itemId);
      if (!itemId || !item || cur.grantedKeys.includes(k)) {
        return { granted: false, item: item || null };
      }
      mutate((prev) => ({
        ...prev,
        ownedCosmetics: prev.ownedCosmetics.includes(itemId)
          ? prev.ownedCosmetics
          : [...prev.ownedCosmetics, itemId],
        equipped: { ...prev.equipped, [item.slot]: itemId },
        grantedKeys: prev.grantedKeys.includes(k) ? prev.grantedKeys : [...prev.grantedKeys, k],
      }));
      return { granted: true, item };
    },
    [mutate],
  );

  /** Equips an owned item into its slot (or any slot, defensively). */
  const equip = useCallback(
    (slot, itemId) => {
      const cur = economyRef.current;
      if (itemId && !cur.ownedCosmetics.includes(itemId)) return;
      mutate((prev) => ({ ...prev, equipped: { ...prev.equipped, [slot]: itemId || null } }));
    },
    [mutate],
  );

  const unequip = useCallback(
    (slot) => {
      mutate((prev) => {
        const equipped = { ...prev.equipped };
        delete equipped[slot];
        return { ...prev, equipped };
      });
    },
    [mutate],
  );

  const value = useMemo(() => {
    const progress = levelProgress(economy.xp);
    return {
      economy,
      loading,
      level: progress.level,
      coins: economy.coins,
      xp: economy.xp,
      levelInfo: progress,
      coinRunsLeft: Math.max(
        0,
        dailyCoinRunLimit(progress.level) -
          (economy.heatCheck.day === economyDayKey() ? economy.heatCheck.coinRunsUsed : 0),
      ),
      dailyCoinRunLimit: dailyCoinRunLimit(progress.level),
      grant,
      hasGranted,
      recordHeatRun,
      recordHeatBonus,
      dailyQuests: economy.dailyQuests,
      setDailyQuests,
      claimQuest,
      buy,
      grantCosmetic,
      equip,
      unequip,
    };
  }, [economy, loading, grant, hasGranted, recordHeatRun, recordHeatBonus, setDailyQuests, claimQuest, buy, grantCosmetic, equip, unequip]);

  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEconomy() {
  const ctx = useContext(EconomyContext);
  if (ctx === null) {
    throw new Error('useEconomy must be used within an EconomyProvider');
  }
  return ctx;
}

/**
 * Safe accessor for just the equipped-cosmetics map. Unlike `useEconomy`, this
 * does NOT throw when called outside an EconomyProvider — it returns an empty
 * map instead, so shared loaders (e.g. the auth gate, which renders before the
 * provider mounts) can show a friendly base avatar without special-casing.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useEquippedCosmetics() {
  const ctx = useContext(EconomyContext);
  return ctx?.economy?.equipped || EMPTY_EQUIPPED;
}

// Stable identity so consumers don't re-render on every provider-less read.
const EMPTY_EQUIPPED = Object.freeze({});
