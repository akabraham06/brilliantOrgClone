import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEconomy } from '../context/EconomyContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useDailyQuests } from '../context/DailyQuestsContext.jsx';
import { useRewardToast } from '../context/RewardToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  HEAT_CHECK,
  streakReward,
  economyDayKey,
  heatRankBonus,
  heatWeeklySettlement,
} from '../data/economy.js';
import { MASTERY_COSMETICS } from '../data/storeRotation.js';
import { buildHeatQueue } from '../data/heatCheck.js';
import {
  submitHeatScore,
  fetchUserRanks,
  fetchWeeklyTop,
  currentWeekKey,
} from '../firebase/leaderboard.js';
import { generateChallengeQuestions } from '../ai/challengeQuestions.js';
import { aiEnabled } from '../firebase/ai.js';
import { getInteractionComponent } from '../components/lesson/interactionRegistry.js';
import InteractionFallback from '../components/lesson/InteractionFallback.jsx';
import Formula from '../components/interactions/Formula.jsx';
import CoinIcon from '../components/economy/CoinIcon.jsx';
import Leaderboard from '../components/heatcheck/Leaderboard.jsx';
import { usePrefersReducedMotion } from '../components/interactions/lib/motion.js';
import { useSupportsWebGL } from '../components/interactions/lib/webgl.js';
import styles from './HeatCheck.module.css';

// Code-split the three.js scenes so three / @react-three/fiber stay out of the
// initial bundle. Only mounted when reduced motion is OFF and WebGL is present.
const HeatIntroScene = lazy(() => import('../components/heatcheck/HeatIntroScene.jsx'));
const HeatFieldScene = lazy(() => import('../components/heatcheck/HeatFieldScene.jsx'));

const REVEAL_OK_MS = 650;
const REVEAL_BAD_MS = 1300;
const CHALLENGE_EVERY = 4; // splice an AI challenge item into the queue this often

/** Streak tier from the heat multiplier (mirrors TIER_LEVEL in heatPalette). */
function heatTier(combo) {
  if (combo >= 2.2) return 'blaze';
  if (combo >= 1.6) return 'hot';
  if (combo > 1) return 'warm';
  return 'cold';
}

function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Speed bonus XP for answering quickly (faded linearly between fastMs and slowMs). */
function speedBonus(elapsedMs) {
  const { fastMs, slowMs, fastBonusXp } = HEAT_CHECK;
  if (elapsedMs <= fastMs) return fastBonusXp;
  if (elapsedMs >= slowMs) return 0;
  return Math.round(fastBonusXp * ((slowMs - elapsedMs) / (slowMs - fastMs)));
}

export default function HeatCheck() {
  const {
    recordHeatRun,
    recordHeatBonus,
    grant,
    grantCosmetic,
    coinRunsLeft,
    dailyCoinRunLimit,
    level,
    loading: economyLoading,
  } = useEconomy();
  const { markDailyActive } = useProgress();
  const { report: reportQuest } = useDailyQuests();
  const { pushReward } = useRewardToast();
  const { user } = useAuth();
  const reduce = usePrefersReducedMotion();

  const [status, setStatus] = useState('intro'); // intro | loading | playing | ended
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(null); // { chosen, correct }
  const [combo, setCombo] = useState(1);
  const [runXp, setRunXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(HEAT_CHECK.durationMs);
  const [result, setResult] = useState(null);
  // Bumped after a score submits so the Leaderboard panel re-fetches; holds the
  // player's current weekly rank for the intro badge.
  const [leaderboardToken, setLeaderboardToken] = useState(0);
  const [myWeeklyRank, setMyWeeklyRank] = useState(null);

  // Refs mirror the live values so timers/handlers read fresh data.
  const comboRef = useRef(1);
  const runXpRef = useRef(0);
  const correctRef = useRef(0);
  const maxComboRef = useRef(1);
  const questionStartRef = useRef(0);
  const lockedRef = useRef(false);
  const timerRef = useRef(null);
  const advanceRef = useRef(null);

  const current = queue[index];

  const clearTimers = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    timerRef.current = null;
    advanceRef.current = null;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Best-effort current weekly rank for the intro badge. Re-runs after a score
  // submits (leaderboardToken). No-ops gracefully when signed out / Firebase off.
  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setMyWeeklyRank(null);
      return undefined;
    }
    let active = true;
    fetchUserRanks(uid).then((r) => {
      if (active) setMyWeeklyRank(r?.weeklyRank ?? null);
    });
    return () => {
      active = false;
    };
  }, [user, leaderboardToken]);

  // Weekly placement settlement: when the player opens Heat Check in a NEW week,
  // compute their FINAL rank in the PREVIOUS week and pay a small, idempotent
  // top-placement reward (keyed heatweekly:<weekKey> so it can't be re-claimed).
  // Gated on economy being hydrated so grantedKeys is loaded before we grant.
  useEffect(() => {
    const uid = user?.uid;
    if (!uid || economyLoading) return undefined;
    let active = true;
    (async () => {
      const prevWeekKey = currentWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const top = await fetchWeeklyTop(prevWeekKey, 50);
      if (!active) return;
      const mine = top.find((row) => row.uid === uid);
      if (!mine) return;
      // Mastery exclusive: "heat-champion" for finishing #1 on the WEEKLY ladder.
      if (mine.rank === 1) {
        const ex = grantCosmetic('heat-champion', 'cosmetic:heat-champion');
        if (ex.granted) pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
      }
      const settlement = heatWeeklySettlement(mine.rank);
      if (!settlement) return;
      const res = grant({ key: `heatweekly:${prevWeekKey}`, xp: settlement.xp, coins: settlement.coins });
      if (res.granted) {
        pushReward({
          amount: res.xp,
          coins: res.coins,
          behavior: settlement.label,
          icon: '\u{1F3C6}',
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [user, economyLoading, grant, grantCosmetic, pushReward]);

  // Submits the finished run to both ladders, then awards the small relative-
  // performance bonus by weekly percentile (coin half gated by the run's daily
  // cap) and records the new weekly rank for the results screen. Best-effort:
  // returns silently when signed out or Firebase is unavailable.
  const submitAndRank = useCallback(
    async ({ xp, coinsBlocked }) => {
      const uid = user?.uid;
      if (!uid || xp <= 0) return;
      const displayName = user?.displayName || 'Learner';
      const photoURL = user?.photoURL || '';
      // Rank as it stands BEFORE this run is recorded, to frame "up N".
      const before = await fetchUserRanks(uid);
      await submitHeatScore({ uid, displayName, photoURL, xp });
      const after = await fetchUserRanks(uid);
      setLeaderboardToken((t) => t + 1);
      if (!after) return;
      const weeklyRank = after.weeklyRank;
      const prevRank = before?.weeklyRank ?? null;
      const delta = prevRank && weeklyRank ? prevRank - weeklyRank : null;
      const bonus = heatRankBonus(weeklyRank, after.weeklyTotal);
      let relBonus = null;
      if (bonus.xp > 0 || bonus.coins > 0) {
        const relCoins = coinsBlocked ? 0 : bonus.coins;
        relBonus = recordHeatBonus({ xp: bonus.xp, coins: relCoins });
        pushReward({
          amount: relBonus.xp,
          coins: relBonus.coins,
          behavior: bonus.label,
          icon: '\u{1F4C8}',
        });
      }
      setResult((cur) =>
        cur ? { ...cur, weeklyRank, weeklyDelta: delta, rankLabel: bonus.label } : cur,
      );
    },
    [user, recordHeatBonus, pushReward],
  );

  const endRun = useCallback(
    (reason) => {
      clearTimers();
      const xp = Math.round(runXpRef.current);
      const baseCoins = Math.round(xp * HEAT_CHECK.coinRate);
      const award = recordHeatRun({ xp, baseCoins });
      // Daily quest: "retrieval" — every correct answer is timed active recall.
      if (correctRef.current > 0) reportQuest('retrieval', correctRef.current);
      // Streak / consistency reward: a Heat Check run counts as daily activity.
      const { streakCount, isNewDay } = markDailyActive();
      if (isNewDay) {
        const sr = streakReward(streakCount);
        const streakRes = grant({ key: `streak:${economyDayKey()}`, xp: sr.xp, coins: sr.coins });
        if (streakRes.granted) {
          pushReward({
            amount: streakRes.xp,
            coins: streakRes.coins,
            behavior: `Day ${streakCount} streak`,
            icon: '\u{1F525}',
          });
        }
        // Mastery exclusive: "devoted" at a 14-day streak.
        if (streakCount >= 14) {
          const ex = grantCosmetic('devoted', 'cosmetic:devoted');
          if (ex.granted) pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
        }
        // Mastery exclusive: "iron-will" at a 30-day streak.
        if (streakCount >= 30) {
          const ex = grantCosmetic('iron-will', 'cosmetic:iron-will');
          if (ex.granted) pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
        }
      }
      // Mastery exclusive: "heat-legend" earned by maxing the heat multiplier.
      const heatLegend = MASTERY_COSMETICS.find((c) => c.id === 'heat-legend');
      if (heatLegend && maxComboRef.current >= HEAT_CHECK.comboMax) {
        const ex = grantCosmetic(heatLegend.id, `cosmetic:${heatLegend.id}`);
        if (ex.granted) pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
      }
      // Mastery exclusive: "inferno-run" for a single run worth >= 350 XP.
      if (xp >= 350) {
        const ex = grantCosmetic('inferno-run', 'cosmetic:inferno-run');
        if (ex.granted) pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
      }
      setResult({ reason, xp, correct: correctRef.current, maxCombo: maxComboRef.current, award });
      setStatus('ended');

      // Global leaderboard submit + relative-performance bonus (async, best-effort).
      void submitAndRank({ xp, coinsBlocked: award.coinsBlocked });
    },
    [clearTimers, recordHeatRun, grant, grantCosmetic, markDailyActive, pushReward, reportQuest, submitAndRank],
  );

  const startRun = useCallback(async () => {
    setStatus('loading');
    const base = buildHeatQueue({ count: 48 });
    const challenges = await generateChallengeQuestions({ count: 6 });
    const challengeItems = challenges.map((c) => ({ ...c, kind: 'challenge', subtitle: 'Challenge' }));

    // Interleave challenge items into the base queue every CHALLENGE_EVERY slots.
    const merged = [];
    let ci = 0;
    base.forEach((item, i) => {
      merged.push(item);
      if ((i + 1) % CHALLENGE_EVERY === 0 && ci < challengeItems.length) {
        merged.push(challengeItems[ci]);
        ci += 1;
      }
    });

    comboRef.current = 1;
    runXpRef.current = 0;
    correctRef.current = 0;
    maxComboRef.current = 1;
    lockedRef.current = false;
    setQueue(merged);
    setIndex(0);
    setReveal(null);
    setCombo(1);
    setRunXp(0);
    setCorrectCount(0);
    setTimeLeft(HEAT_CHECK.durationMs);
    setResult(null);
    setStatus('playing');

    const start = window.performance.now();
    questionStartRef.current = start;
    timerRef.current = window.setInterval(() => {
      const left = HEAT_CHECK.durationMs - (window.performance.now() - start);
      if (left <= 0) {
        setTimeLeft(0);
        endRun('time');
      } else {
        setTimeLeft(left);
      }
    }, 200);
  }, [endRun]);

  const handleAnswer = useCallback(
    (option) => {
      if (lockedRef.current || status !== 'playing' || !current) return;
      lockedRef.current = true;
      const correct = option === current.answer;
      setReveal({ chosen: option, correct });

      if (!correct) {
        advanceRef.current = window.setTimeout(() => endRun('wrong'), reduce ? 600 : REVEAL_BAD_MS);
        return;
      }

      const elapsed = window.performance.now() - questionStartRef.current;
      const bonus = speedBonus(elapsed);
      const challengeBonus = current.kind === 'challenge' ? HEAT_CHECK.challengeBonusXp : 0;
      const gain = Math.round(HEAT_CHECK.baseXpPerCorrect * comboRef.current + bonus + challengeBonus);

      runXpRef.current += gain;
      correctRef.current += 1;
      comboRef.current = Math.min(HEAT_CHECK.comboMax, comboRef.current + HEAT_CHECK.comboStep);
      maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);

      setRunXp(runXpRef.current);
      setCorrectCount(correctRef.current);
      setCombo(comboRef.current);

      advanceRef.current = window.setTimeout(() => {
        const next = index + 1;
        if (next >= queue.length) {
          endRun('cleared');
          return;
        }
        setIndex(next);
        setReveal(null);
        lockedRef.current = false;
        questionStartRef.current = window.performance.now();
      }, reduce ? 350 : REVEAL_OK_MS);
    },
    [current, status, index, queue.length, endRun, reduce],
  );

  const comboPct = useMemo(() => {
    const span = HEAT_CHECK.comboMax - 1;
    return span > 0 ? Math.min(100, ((combo - 1) / span) * 100) : 0;
  }, [combo]);

  if (status === 'intro' || status === 'loading') {
    return (
      <HeatIntro
        loading={status === 'loading'}
        coinRunsLeft={coinRunsLeft}
        dailyLimit={dailyCoinRunLimit}
        level={level}
        onStart={startRun}
        reduce={reduce}
        uid={user?.uid || null}
        weeklyRank={myWeeklyRank}
        leaderboardToken={leaderboardToken}
      />
    );
  }

  if (status === 'ended' && result) {
    return (
      <HeatResults
        result={result}
        onAgain={startRun}
        coinRunsLeft={coinRunsLeft}
        uid={user?.uid || null}
        leaderboardToken={leaderboardToken}
      />
    );
  }

  const timePct = (timeLeft / HEAT_CHECK.durationMs) * 100;
  const lowTime = timeLeft <= 30000;
  const tier = heatTier(combo);

  return (
    <div className={styles.player}>
      <HeatBackdrop tier={tier} reduce={reduce} />

      <section className={styles.panel}>
        <header className={styles.hud}>
          <Link to="/app/home" className={styles.quit} aria-label="Leave Heat Check">
            &larr; Leave
          </Link>
          <div className={`${styles.timer} ${lowTime ? styles.timerLow : ''}`} aria-live="off">
            <span className={styles.timerIcon} aria-hidden="true">&#9201;</span>
            {formatTime(timeLeft)}
          </div>
          <div className={styles.runXp}>
            <span className={styles.runXpVal}>{runXp}</span> XP
          </div>
        </header>

        <div
          className={styles.timeTrack}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={HEAT_CHECK.durationMs}
          aria-valuenow={Math.round(timeLeft)}
          aria-label="Time remaining"
        >
          <div className={styles.timeFill} style={{ width: `${timePct}%` }} />
        </div>

        <HeatMeter combo={combo} pct={comboPct} reduce={reduce} correctCount={correctCount} />

        <main className={styles.stage}>
          <div className={styles.cardMeta}>
            <span className={`${styles.kind} ${current?.kind === 'challenge' ? styles.kindChallenge : ''}`}>
              {current?.kind === 'challenge' ? '\u2728 Challenge' : current?.subtitle}
            </span>
          </div>

          <div className={styles.stageBody}>
            {current?.kind === 'diagram' && current.diagramKey && (
              <div className={styles.diagram}>
                <Suspense fallback={<InteractionFallback />}>
                  <DiagramView keyName={current.diagramKey} />
                </Suspense>
              </div>
            )}

            <h2 className={styles.prompt}>
              <Formula value={current?.prompt || ''} />
            </h2>
          </div>

          <div className={styles.options}>
            {current?.options.map((option) => {
              const isChosen = reveal?.chosen === option;
              const isAnswer = option === current.answer;
              let cls = styles.option;
              if (reveal) {
                if (isAnswer) cls += ` ${styles.optionCorrect}`;
                else if (isChosen) cls += ` ${styles.optionWrong}`;
                else cls += ` ${styles.optionDim}`;
              }
              return (
                <button
                  key={option}
                  type="button"
                  className={cls}
                  onClick={() => handleAnswer(option)}
                  disabled={Boolean(reveal)}
                >
                  <Formula value={option} />
                </button>
              );
            })}
          </div>
        </main>
      </section>
    </div>
  );
}

function DiagramView({ keyName }) {
  const Interaction = getInteractionComponent(keyName);
  const slide = { slideId: `hc-${keyName}`, interactionComponentKey: keyName, interactionConfig: {} };
  const noop = useRef(() => {}).current;
  return (
    <DiagramBoundary>
      <Interaction slide={slide} onReady={noop} savedState={undefined} onSaveState={noop} />
    </DiagramBoundary>
  );
}

/** Keeps a misconfigured interactive from crashing the whole Heat Check run. */
class DiagramBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <div className={styles.diagramFallback}>Interactive preview unavailable</div>;
    }
    return this.props.children;
  }
}

/**
 * Catches a failed WebGL/Canvas mount (lost context, driver crash) and renders
 * the static CSS fallback instead, so a 3D failure never blanks the backdrop.
 */
class WebGLBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Backdrop behind the live-round panel. Prefers the tier-reactive three.js heat
 * field, but degrades to the static CSS aura/glow for prefers-reduced-motion,
 * missing WebGL, or a runtime canvas failure. Always decorative + non-blocking
 * (pointer-events: none, behind the panel via z-index).
 */
function HeatBackdrop({ tier, reduce }) {
  const webgl = useSupportsWebGL();
  const fallback = (
    <div className={styles.aura} aria-hidden="true" data-tier={tier} data-reduce={reduce} />
  );

  if (reduce || !webgl) return fallback;

  return (
    <WebGLBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <div className={styles.scene} aria-hidden="true">
          <HeatFieldScene tier={tier} />
        </div>
      </Suspense>
    </WebGLBoundary>
  );
}

function HeatMeter({ combo, pct, reduce, correctCount }) {
  const tier = heatTier(combo);
  return (
    <div className={styles.meterRow}>
      <div className={styles.flame} data-tier={tier} data-reduce={reduce} aria-hidden="true">
        &#128293;
      </div>
      <div className={styles.meterBody}>
        <div className={styles.meterTop}>
          <span className={styles.multiplier}>&times;{combo.toFixed(2)}</span>
          <span className={styles.streak}>{correctCount} in a row</span>
        </div>
        <div className={styles.meterTrack}>
          <div className={styles.meterFill} data-tier={tier} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function HeatIntro({ loading, coinRunsLeft, dailyLimit, level, onStart, reduce, uid, weeklyRank, leaderboardToken }) {
  const noCoins = coinRunsLeft <= 0;
  const webgl = useSupportsWebGL();
  const introFallback = <div className={styles.introGlow} aria-hidden="true" />;
  return (
    <div className={styles.intro}>
      {reduce || !webgl ? (
        // Reduced-motion / no WebGL: skip the 3D scene, keep the static glow.
        introFallback
      ) : (
        <WebGLBoundary fallback={introFallback}>
          <Suspense fallback={introFallback}>
            <div className={styles.introScene} aria-hidden="true">
              <HeatIntroScene />
            </div>
          </Suspense>
        </WebGLBoundary>
      )}
      <div className={`${styles.introCard} ${reduce ? '' : styles.introCardLive}`}>
        <div className={styles.introFlame} aria-hidden="true">&#128293;</div>
        <h1 className={styles.introTitle}>Heat Check</h1>
        {Number(weeklyRank) > 0 && (
          <div className={styles.rankBadge}>
            <span aria-hidden="true">&#127942;</span>
            You&apos;re <strong>#{weeklyRank}</strong> this week
          </div>
        )}
        <p className={styles.introSub}>
          A 5-minute speed gauntlet. Answer fast, build your heat multiplier, and
          earn the <strong>highest XP &amp; coin rate</strong> in the app. One wrong
          answer ends the run — how hot can you get?
        </p>

        <ul className={styles.introList}>
          <li><span aria-hidden="true">&#9889;</span> Faster answers + longer streaks = more XP</li>
          <li><span aria-hidden="true">&#10060;</span> First wrong answer stops the run</li>
          <li><span aria-hidden="true">&#10024;</span> {aiEnabled ? 'Challenge questions worth bonus XP' : 'Curated challenge questions in the mix'}</li>
        </ul>

        <div className={styles.runsBadge} data-empty={noCoins}>
          <CoinIcon size={16} />
          {noCoins ? (
            <span>Daily coin runs used — runs now earn XP only (resets tomorrow)</span>
          ) : (
            <span>
              <strong>{coinRunsLeft}</strong> of {dailyLimit} coin-earning runs left today
            </span>
          )}
        </div>

        <button type="button" className={styles.startBtn} onClick={onStart} disabled={loading}>
          {loading ? 'Heating up\u2026' : 'Start Heat Check'}
        </button>
        <p className={styles.introFoot}>Level {level} &middot; coin runs scale up as you level</p>
        <Link to="/app/home" className={styles.introBack}>Back to home</Link>

        <div className={styles.leaderboardWrap}>
          <Leaderboard uid={uid} refreshToken={leaderboardToken} />
        </div>
      </div>
    </div>
  );
}

function HeatResults({ result, onAgain, coinRunsLeft, uid, leaderboardToken }) {
  const { reason, correct, maxCombo, award, weeklyRank, weeklyDelta } = result;
  let headline = 'Run complete!';
  if (reason === 'wrong') headline = 'Streak broken!';
  else if (reason === 'time') headline = "Time's up!";
  else if (reason === 'cleared') headline = 'You cleared the gauntlet!';

  let rankLine = null;
  if (Number(weeklyRank) > 0) {
    let move = '';
    if (Number(weeklyDelta) > 0) move = ` \u2014 up ${weeklyDelta}`;
    else if (Number(weeklyDelta) < 0) move = ` \u2014 down ${Math.abs(weeklyDelta)}`;
    rankLine = `You're #${weeklyRank} this week${move}`;
  }

  return (
    <div className={styles.intro}>
      <div className={styles.introGlow} aria-hidden="true" />
      <div className={styles.introCard}>
        <div className={styles.introFlame} aria-hidden="true">{reason === 'wrong' ? '\u{1F4A8}' : '\u{1F525}'}</div>
        <h1 className={styles.introTitle}>{headline}</h1>

        <div className={styles.resultStats}>
          <div className={styles.resultStat}>
            <span className={styles.resultVal}>+{award.xp}</span>
            <span className={styles.resultLabel}>XP earned</span>
          </div>
          <div className={styles.resultStat}>
            <span className={styles.resultVal}>
              <CoinIcon size={20} /> {award.coins}
            </span>
            <span className={styles.resultLabel}>Coins</span>
          </div>
          <div className={styles.resultStat}>
            <span className={styles.resultVal}>{correct}</span>
            <span className={styles.resultLabel}>Correct</span>
          </div>
          <div className={styles.resultStat}>
            <span className={styles.resultVal}>&times;{maxCombo.toFixed(2)}</span>
            <span className={styles.resultLabel}>Best heat</span>
          </div>
        </div>

        {rankLine && (
          <p className={styles.rankLine}>
            <span aria-hidden="true">&#127942;</span> {rankLine}
          </p>
        )}
        {award.leveledUp && (
          <p className={styles.levelUp}>&#11088; Level up! You reached level {award.toLevel}.</p>
        )}
        {award.coinsBlocked && (
          <p className={styles.blocked}>
            Daily coin runs are used up — this run earned XP only. Coins reset tomorrow.
          </p>
        )}
        {!award.coinsBlocked && (
          <p className={styles.introFoot}>{coinRunsLeft} coin-earning runs left today</p>
        )}

        <div className={styles.resultActions}>
          <button type="button" className={styles.startBtn} onClick={onAgain}>
            Run it again
          </button>
          <Link to="/app/store" className={styles.introBack}>Spend coins in the Store &rarr;</Link>
        </div>

        <div className={styles.leaderboardWrap}>
          <Leaderboard uid={uid} refreshToken={leaderboardToken} />
        </div>
      </div>
    </div>
  );
}
