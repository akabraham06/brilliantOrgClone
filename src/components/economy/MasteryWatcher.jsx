import { useEffect } from 'react';
import { useEconomy } from '../../context/EconomyContext.jsx';
import { useRewardToast } from '../../context/RewardToastContext.jsx';

// Level-gated mastery exclusives (see data/storeRotation.js MASTERY_COSMETICS).
// Watching the derived `level` catches a threshold being reached via ANY XP
// path (lesson/check/course grants, Heat Check runs, quest claims, …) rather
// than wiring the same check into every call site.
const LEVEL_MASTERY = [
  { level: 20, id: 'prodigy' },
  { level: 35, id: 'grandmaster' },
];

/**
 * Headless watcher that grants level-based mastery skins and pushes a reward
 * toast. Mounted INSIDE the RewardToastProvider (which nests under the
 * EconomyProvider) so it can both read the economy and surface toasts. Grants
 * are idempotent via grantCosmetic, so re-checking on every level change (and on
 * hydrate) is safe and also back-fills accounts that were already past a gate.
 */
export default function MasteryWatcher() {
  const { level, grantCosmetic, loading } = useEconomy();
  const { pushReward } = useRewardToast();

  useEffect(() => {
    if (loading) return;
    for (const m of LEVEL_MASTERY) {
      if (level >= m.level) {
        const ex = grantCosmetic(m.id, `cosmetic:${m.id}`);
        if (ex.granted) {
          pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
        }
      }
    }
  }, [level, loading, grantCosmetic, pushReward]);

  return null;
}
