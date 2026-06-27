import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { aiEnabled } from '../firebase/ai.js';
import { useEconomy } from './EconomyContext.jsx';
import { useContent } from './ContentContext.jsx';
import { useProgress } from './ProgressContext.jsx';
import { useLearnerProfile } from '../ai/useLearnerProfile.js';
import { useLearnerMemory } from '../ai/useLearnerMemory.js';
import {
  buildDailyQuestContext,
  generateDailyQuests,
} from '../ai/dailyQuestGenerator.js';
import {
  questDayKey,
  emptyDailyQuests,
  isQuestComplete,
  isQuestClaimed,
  totalQuestRewards,
  DAILY_QUEST_CAP,
} from '../data/dailyQuests.js';

const DailyQuestsContext = createContext(null);

/**
 * Orchestrates the daily-quest loop on top of the economy store:
 *  1. Generates today's 3–4 quests once per local day from the learner's
 *     performance context (AI copy + deterministic structure/rewards), persisting
 *     them into economy.dailyQuests.
 *  2. Exposes the quests merged with live progress / claim state.
 *  3. `report(metric, amount)` advances quest progress from real in-app actions.
 *  4. `claim(questId)` pays out the cap-clamped, idempotent reward.
 *
 * Generation only runs after the economy has hydrated (so persisted quests aren't
 * clobbered) and is guarded to one attempt per day.
 */
export function DailyQuestsProvider({ children }) {
  const { dailyQuests, setDailyQuests, claimQuest, loading } = useEconomy();
  const { lessons } = useContent();
  const { progress } = useProgress();
  const profile = useLearnerProfile();
  const { memory, loaded: memoryLoaded } = useLearnerMemory();

  const [generating, setGenerating] = useState(false);
  const genDayRef = useRef(null);
  const today = questDayKey();

  // Keep a fresh mirror so event handlers can read/update the latest blob.
  const blobRef = useRef(dailyQuests);
  blobRef.current = dailyQuests;

  useEffect(() => {
    if (loading || !memoryLoaded) return undefined;
    const hasToday = dailyQuests?.day === today && dailyQuests.quests?.length > 0;
    if (hasToday || genDayRef.current === today) return undefined;
    genDayRef.current = today;

    let alive = true;
    setGenerating(true);
    const context = buildDailyQuestContext({ profile, memory, lessons, progress });
    generateDailyQuests({ context, profile })
      .then(({ quests }) => {
        if (!alive) return;
        setDailyQuests({ ...emptyDailyQuests(today), quests });
      })
      .finally(() => {
        if (alive) setGenerating(false);
      });
    return () => {
      alive = false;
    };
    // profile/memory/progress are read once at generation time; we intentionally
    // depend only on the gates so quests are stable for the whole day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, memoryLoaded, today, dailyQuests?.day, dailyQuests?.quests?.length]);

  const quests = useMemo(() => {
    const blob = dailyQuests?.day === today ? dailyQuests : emptyDailyQuests(today);
    return (blob.quests || []).map((q) => ({
      ...q,
      progress: Math.min(q.target, blob.progress?.[q.metric] || 0),
      complete: isQuestComplete(q, blob.progress),
      claimed: isQuestClaimed(q, blob),
    }));
  }, [dailyQuests, today]);

  /** Advances progress for the active quest tracking `metric` (no-op if done). */
  const report = useCallback(
    (metric, amount = 1) => {
      if (!metric || amount <= 0) return;
      const cur = blobRef.current;
      if (!cur || cur.day !== questDayKey()) return;
      const quest = (cur.quests || []).find((q) => q.metric === metric);
      if (!quest) return;
      const have = cur.progress?.[metric] || 0;
      if (have >= quest.target) return;
      setDailyQuests({
        ...cur,
        progress: { ...cur.progress, [metric]: Math.min(quest.target, have + amount) },
      });
    },
    [setDailyQuests],
  );

  /** Claims a completed quest's reward (idempotent, cap-clamped). */
  const claim = useCallback(
    (questId) => {
      const cur = blobRef.current;
      const quest = (cur?.quests || []).find((q) => q.id === questId);
      if (!quest) return { granted: false, xp: 0, coins: 0 };
      if (!isQuestComplete(quest, cur.progress) || isQuestClaimed(quest, cur)) {
        return { granted: false, xp: 0, coins: 0 };
      }
      return claimQuest(quest);
    },
    [claimQuest],
  );

  const totals = useMemo(() => {
    const nominal = totalQuestRewards(quests);
    const blob = dailyQuests?.day === today ? dailyQuests : emptyDailyQuests(today);
    return {
      xpAvailable: Math.min(DAILY_QUEST_CAP.xp, nominal.xp),
      coinsAvailable: Math.min(DAILY_QUEST_CAP.coins, nominal.coins),
      xpClaimed: blob.claimedXp || 0,
      coinsClaimed: blob.claimedCoins || 0,
      capXp: DAILY_QUEST_CAP.xp,
      capCoins: DAILY_QUEST_CAP.coins,
    };
  }, [quests, dailyQuests, today]);

  const value = useMemo(
    () => ({
      quests,
      totals,
      generating,
      aiEnabled,
      report,
      claim,
      allClaimed: quests.length > 0 && quests.every((q) => q.claimed),
    }),
    [quests, totals, generating, report, claim],
  );

  return <DailyQuestsContext.Provider value={value}>{children}</DailyQuestsContext.Provider>;
}

const DEFAULT = Object.freeze({
  quests: [],
  totals: { xpAvailable: 0, coinsAvailable: 0, xpClaimed: 0, coinsClaimed: 0, capXp: 0, capCoins: 0 },
  generating: false,
  aiEnabled,
  report: () => {},
  claim: () => ({ granted: false, xp: 0, coins: 0 }),
  allClaimed: false,
});

/**
 * Non-throwing accessor (mirrors useEquippedCosmetics) so the many in-app action
 * surfaces that REPORT quest progress can call it safely even if they ever render
 * outside the provider — they just get a no-op reporter.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useDailyQuests() {
  return useContext(DailyQuestsContext) || DEFAULT;
}
