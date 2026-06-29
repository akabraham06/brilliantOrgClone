import { useEffect, useState } from 'react';
import {
  fetchWeeklyTop,
  fetchAllTimeTop,
  fetchUserRanks,
} from '../../firebase/leaderboard.js';
import { usePrefersReducedMotion } from '../interactions/lib/motion.js';
import styles from './Leaderboard.module.css';

const TOP_N = 50;

const TABS = [
  { id: 'week', label: 'This week' },
  { id: 'all', label: 'All-time' },
];

/**
 * Global Heat Check leaderboard panel with two tabs:
 *   • "This week" (Section A) — the competitive weekly ladder.
 *   • "All-time" (Section B) — lifetime bests.
 *
 * Self-fetches from the Firestore-backed helpers, which degrade gracefully to
 * empty arrays/null when Firebase is unavailable — so this panel simply shows an
 * empty/unavailable state and never crashes. The signed-in player's row is
 * highlighted, and their own rank is surfaced below the cut even when they're
 * outside the visible top N. Re-fetches whenever `refreshToken` changes (e.g.
 * after a run submits a new score).
 */
export default function Leaderboard({ uid, refreshToken = 0 }) {
  const reduce = usePrefersReducedMotion();
  const [tab, setTab] = useState('week');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [ranks, setRanks] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      tab === 'week' ? fetchWeeklyTop(undefined, TOP_N) : fetchAllTimeTop(TOP_N),
      uid ? fetchUserRanks(uid) : Promise.resolve(null),
    ])
      .then(([top, userRanks]) => {
        if (!active) return;
        setRows(Array.isArray(top) ? top : []);
        setRanks(userRanks);
      })
      .catch(() => {
        if (!active) return;
        setRows([]);
        setRanks(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab, uid, refreshToken]);

  const inTop = uid ? rows.some((r) => r.uid === uid) : false;
  const myRank = tab === 'week' ? ranks?.weeklyRank : ranks?.allTimeRank;
  const myBest = tab === 'week' ? ranks?.weeklyBest : ranks?.allTimeBest;
  // Show a dedicated "your rank" footer row only when the player has a score on
  // this ladder but isn't already visible in the top N.
  const showOwnRow = Boolean(uid) && !inTop && Number(myRank) > 0;

  return (
    <section className={styles.panel} aria-label="Heat Check leaderboard">
      <header className={styles.head}>
        <h2 className={styles.title}>
          <span aria-hidden="true">&#127942;</span> Leaderboard
        </h2>
        <div className={styles.tabs} role="tablist" aria-label="Leaderboard range">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.body}>
        {loading ? (
          <ul className={styles.skeletonList} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className={`${styles.skeleton} ${reduce ? '' : styles.skeletonPulse}`}
              />
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <p className={styles.empty}>
            No scores yet this {tab === 'week' ? 'week' : 'time'}. Finish a Heat Check
            run to claim the top spot!
          </p>
        ) : (
          <ol className={styles.list}>
            {rows.map((row) => (
              <Row key={row.uid || row.rank} row={row} isMe={Boolean(uid) && row.uid === uid} />
            ))}
          </ol>
        )}
      </div>

      {showOwnRow && (
        <div className={styles.ownRow}>
          <span className={styles.ownLabel}>Your rank</span>
          <Row
            row={{ rank: myRank, displayName: 'You', bestXp: myBest }}
            isMe
            bare
          />
        </div>
      )}
    </section>
  );
}

/** A single leaderboard line: rank medal, name, best XP. */
function Row({ row, isMe, bare = false }) {
  const medal = row.rank <= 3 ? ['gold', 'silver', 'bronze'][row.rank - 1] : null;
  return (
    <li
      className={`${styles.row} ${isMe ? styles.rowMe : ''} ${bare ? styles.rowBare : ''}`}
    >
      <span className={`${styles.rank} ${medal ? styles.medal : ''}`} data-medal={medal || undefined}>
        {row.rank}
      </span>
      <span className={styles.name}>{row.displayName || 'Learner'}</span>
      <span className={styles.score}>
        <span className={styles.flame} aria-hidden="true">&#128293;</span>
        <span className={styles.scoreVal}>{Math.round(row.bestXp || 0).toLocaleString()}</span>
        <span className={styles.scoreUnit}>XP</span>
      </span>
    </li>
  );
}
