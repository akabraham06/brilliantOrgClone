import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  where,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from './config.js';

/**
 * Global, Firestore-backed Heat Check leaderboard. Two ladders:
 *
 *   • ALL-TIME (Section B): `heatLeaderboard/{uid}` — one lifetime-best doc per
 *     player. Queried with orderBy('bestXp','desc') (single-field, auto-indexed).
 *   • WEEKLY (Section A): `heatWeekly/{weekKey}/scores/{uid}` — each ISO week is
 *     its own subcollection, so the ladder "resets" every week with no stale data
 *     and no composite index. Queried with orderBy('bestXp','desc') as well.
 *
 * Every helper guards on `db` and degrades gracefully (returns an empty/zero
 * value, never throws) when Firestore is unavailable, mirroring the other
 * firebase helpers (economy.js / progress.js). Writes use merge:true +
 * serverTimestamp() and only upsert when a new run beats the stored best.
 */

// Cap any rank/total scan so a huge ladder can't blow up reads. Best-effort by
// design — ranks past this depth are reported relative to the capped field.
const RANK_SCAN_CAP = 500;

// Defensive clamp on the denormalized display name we store on each score doc.
const MAX_NAME = 60;

/**
 * ISO-8601 week id for `date`, e.g. "2026-W26". Weeks start Monday and week 1 is
 * the week containing the first Thursday of the ISO year, so the year rolls over
 * correctly at the boundary (late Dec / early Jan can belong to the adjacent
 * ISO year). Pure — used as the `weekKey` subcollection segment. UTC-based so a
 * given instant maps to one stable key regardless of the viewer's timezone.
 */
export function currentWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // shift to the Thursday of this week
  const isoYear = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / 604800000);
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

function sanitizeName(displayName) {
  const name = String(displayName || 'Learner').trim() || 'Learner';
  return name.slice(0, MAX_NAME);
}

function safeXp(xp) {
  return Math.max(0, Math.round(Number(xp) || 0));
}

/**
 * Upserts the player's run into BOTH ladders, but only where it beats the stored
 * best (all-time lifetime best + this week's best). Returns the resulting bests
 * { allTimeBest, weeklyBest } so callers can frame "new personal best" UI.
 * No-ops to zeros when Firestore is unavailable.
 */
export async function submitHeatScore({ uid, displayName, photoURL, xp } = {}) {
  if (!db || !uid) return { allTimeBest: 0, weeklyBest: 0 };
  const runXp = safeXp(xp);
  const name = sanitizeName(displayName);
  const weekKey = currentWeekKey();

  try {
    // All-time (Section B): lifetime best.
    const allRef = doc(db, 'heatLeaderboard', uid);
    const allSnap = await getDoc(allRef);
    const allBest = Math.max(0, Number(allSnap.data()?.bestXp) || 0);
    let allTimeBest = allBest;
    if (runXp > allBest) {
      const payload = { uid, displayName: name, bestXp: runXp, updatedAt: serverTimestamp() };
      if (photoURL) payload.photoURL = String(photoURL);
      await setDoc(allRef, payload, { merge: true });
      allTimeBest = runXp;
    }

    // Weekly (Section A): this week's best, in its own subcollection.
    const weekRef = doc(db, 'heatWeekly', weekKey, 'scores', uid);
    const weekSnap = await getDoc(weekRef);
    const weekBest = Math.max(0, Number(weekSnap.data()?.bestXp) || 0);
    let weeklyBest = weekBest;
    if (runXp > weekBest) {
      await setDoc(
        weekRef,
        { uid, displayName: name, bestXp: runXp, updatedAt: serverTimestamp() },
        { merge: true },
      );
      weeklyBest = runXp;
    }

    return { allTimeBest, weeklyBest };
  } catch (err) {
    console.error('[leaderboard] submit failed:', err);
    return { allTimeBest: 0, weeklyBest: 0 };
  }
}

/** Maps an ordered query snapshot into ranked { rank, uid, displayName, ... } rows. */
function rankRows(snap) {
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}

/**
 * The top `n` entries on the current (or given) weekly ladder, ordered by best
 * XP. Returns an empty array when Firestore is unavailable or the week is empty.
 */
export async function fetchWeeklyTop(weekKey = currentWeekKey(), n = 50) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'heatWeekly', weekKey, 'scores'),
      orderBy('bestXp', 'desc'),
      limit(n),
    );
    return rankRows(await getDocs(q));
  } catch (err) {
    console.error('[leaderboard] weekly fetch failed:', err);
    return [];
  }
}

/** The top `n` entries on the all-time ladder, ordered by lifetime best XP. */
export async function fetchAllTimeTop(n = 50) {
  if (!db) return [];
  try {
    const q = query(collection(db, 'heatLeaderboard'), orderBy('bestXp', 'desc'), limit(n));
    return rankRows(await getDocs(q));
  } catch (err) {
    console.error('[leaderboard] all-time fetch failed:', err);
    return [];
  }
}

/**
 * Best-effort current weekly + all-time rank for `uid` (1 = best). Computed by
 * counting entries with a strictly higher bestXp via a single-field inequality
 * query (auto-indexed, capped to RANK_SCAN_CAP). Also reports the player's bests
 * and the (capped) weekly field size for percentile math. Returns null when
 * Firestore is unavailable; per-ladder fields stay null when the player has no
 * entry there yet.
 */
export async function fetchUserRanks(uid) {
  if (!db || !uid) return null;
  const weekKey = currentWeekKey();
  const result = {
    weekKey,
    weeklyRank: null,
    weeklyBest: 0,
    weeklyTotal: 0,
    allTimeRank: null,
    allTimeBest: 0,
  };

  try {
    // Weekly rank + the player's weekly best.
    const weekSnap = await getDoc(doc(db, 'heatWeekly', weekKey, 'scores', uid));
    if (weekSnap.exists()) {
      const myBest = Math.max(0, Number(weekSnap.data()?.bestXp) || 0);
      result.weeklyBest = myBest;
      const higher = await getDocs(
        query(
          collection(db, 'heatWeekly', weekKey, 'scores'),
          where('bestXp', '>', myBest),
          limit(RANK_SCAN_CAP),
        ),
      );
      result.weeklyRank = higher.size + 1;
    }

    // Capped weekly field size (for percentile buckets).
    const fieldSnap = await getDocs(
      query(
        collection(db, 'heatWeekly', weekKey, 'scores'),
        orderBy('bestXp', 'desc'),
        limit(RANK_SCAN_CAP),
      ),
    );
    result.weeklyTotal = fieldSnap.size;

    // All-time rank + the player's lifetime best.
    const allSnap = await getDoc(doc(db, 'heatLeaderboard', uid));
    if (allSnap.exists()) {
      const myBest = Math.max(0, Number(allSnap.data()?.bestXp) || 0);
      result.allTimeBest = myBest;
      const higher = await getDocs(
        query(
          collection(db, 'heatLeaderboard'),
          where('bestXp', '>', myBest),
          limit(RANK_SCAN_CAP),
        ),
      );
      result.allTimeRank = higher.size + 1;
    }

    return result;
  } catch (err) {
    console.error('[leaderboard] ranks failed:', err);
    return null;
  }
}
