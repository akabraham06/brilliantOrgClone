import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDailyQuests } from '../../context/DailyQuestsContext.jsx';
import { useRewardToast } from '../../context/RewardToastContext.jsx';
import { PRINCIPLE_META, msUntilReset } from '../../data/dailyQuests.js';
import CoinIcon from '../economy/CoinIcon.jsx';
import styles from './DailyQuestsPanel.module.css';

/** "Hh Mm" until local-midnight reset (no live seconds — gentle on re-renders). */
function formatCountdown(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const STORAGE_KEY = 'dailyQuests.expanded';

/** Persisted collapsed/expanded state — defaults collapsed so the panel stays a
 *  compact strip and never pushes the primary content below the fold. */
function useExpandedState() {
  const [open, setOpen] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
    } catch {
      /* ignore quota / privacy-mode failures */
    }
  }, [open]);
  return [open, setOpen];
}

/**
 * Daily Quests menu. A compact, collapsible strip: a summary header always shows
 * the title, how many quests are ready to claim, and overall progress, so it
 * never dominates the viewport. Expanding it reveals the day's AI-personalized,
 * performance-aware quests with their learning-science rationale, live progress,
 * claim buttons, the total (capped) XP/coins available, and a reset countdown.
 *
 * Reuses theme tokens throughout and respects prefers-reduced-motion (all motion
 * is via --transition-* tokens, which collapse to 0ms under reduced motion).
 */
export default function DailyQuestsPanel({ className = '' }) {
  const { quests, totals, generating, claim, allClaimed } = useDailyQuests();
  const [open, setOpen] = useExpandedState();
  const bodyId = useId();

  const [countdown, setCountdown] = useState(() => msUntilReset());
  useEffect(() => {
    if (!open) return undefined;
    const id = window.setInterval(() => setCountdown(msUntilReset()), 30000);
    return () => window.clearInterval(id);
  }, [open]);

  const claimable = quests.filter((q) => q.complete && !q.claimed).length;
  const total = quests.length;
  const done = quests.filter((q) => q.claimed).length;

  return (
    <section className={`${styles.panel} ${className}`} aria-label="Daily quests">
      <button
        type="button"
        className={styles.summary}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.titleRow}>
          <span className={styles.eyebrow}>Daily Quests</span>
        </span>

        <span className={styles.status}>
          {generating && total === 0 ? (
            <span className={styles.statusBuilding}>Building&hellip;</span>
          ) : claimable > 0 ? (
            <span className={styles.claimReady}>
              {claimable} ready to claim
            </span>
          ) : allClaimed ? (
            <span className={styles.statusDone}>&#10003; All claimed</span>
          ) : (
            <span className={styles.progressMini}>{done}/{total} done</span>
          )}
          <span
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {open && (
        <div className={styles.body} id={bodyId}>
          <div className={styles.bodyHead}>
            <p className={styles.blurb}>
              A small, personalized set built from how you&rsquo;ve been doing &mdash; tuned to
              make learning <strong>stick</strong>.
            </p>
            <span className={styles.countdown} title="Quests refresh at midnight">
              <span aria-hidden="true">&#9201;</span> Resets in {formatCountdown(countdown)}
            </span>
          </div>

          {generating && quests.length === 0 ? (
            <div className={styles.loading} role="status" aria-live="polite">
              <span className={styles.dots}><span /><span /><span /></span>
              Building today&rsquo;s quests&hellip;
            </div>
          ) : (
            <ul className={styles.list}>
              {quests.map((quest) => (
                <QuestRow key={quest.id} quest={quest} onClaim={() => claim(quest.id)} />
              ))}
            </ul>
          )}

          <footer className={styles.footer}>
            {allClaimed ? (
              <span className={styles.footAllDone}>
                &#10003; All quests claimed &mdash; come back tomorrow for a fresh set.
              </span>
            ) : (
              <span className={styles.footTotals}>
                Up to{' '}
                <strong className={styles.totalXp}>{totals.xpAvailable} XP</strong> &amp;{' '}
                <strong className={styles.totalCoins}>
                  <CoinIcon size={14} /> {totals.coinsAvailable}
                </strong>{' '}
                today
              </span>
            )}
            <span className={styles.capNote} title="A daily cap keeps quests a small bonus on top of lessons and Heat Check.">
              daily cap {totals.capXp} XP / {totals.capCoins}
              <CoinIcon size={12} />
            </span>
          </footer>
        </div>
      )}
    </section>
  );
}

function QuestRow({ quest, onClaim }) {
  const meta = PRINCIPLE_META[quest.principle] || {};
  const { pushReward } = useRewardToast();
  const [sciOpen, setSciOpen] = useState(false);
  const [flash, setFlash] = useState(null);
  const flashTimer = useRef(null);
  const pct = quest.target ? Math.min(100, Math.round((quest.progress / quest.target) * 100)) : 0;

  useEffect(() => () => flashTimer.current && window.clearTimeout(flashTimer.current), []);

  function handleClaim() {
    const res = onClaim();
    if (res?.granted) {
      setFlash(res);
      flashTimer.current = window.setTimeout(() => setFlash(null), 2200);
      // Frame the reward by the learning principle it rewarded, not the coins.
      pushReward({
        amount: res.xp,
        coins: res.coins,
        behavior: meta.label || 'Daily quest',
        icon: meta.icon,
      });
    }
  }

  return (
    <li
      className={`${styles.quest} ${quest.complete ? styles.questComplete : ''} ${quest.claimed ? styles.questClaimed : ''}`}
      style={{ '--quest-accent': meta.accent || 'var(--accent-purple)' }}
    >
      <span className={styles.icon} aria-hidden="true">
        {quest.claimed ? '\u2713' : meta.icon}
      </span>

      <div className={styles.body}>
        <div className={styles.questHead}>
          <span className={styles.questTitle}>{quest.title}</span>
          <button
            type="button"
            className={styles.principle}
            aria-expanded={sciOpen}
            onClick={() => setSciOpen((v) => !v)}
            title="Why this helps you learn"
          >
            {meta.label}
            <span className={styles.info} aria-hidden="true">&#9432;</span>
          </button>
        </div>

        <p className={styles.questDesc}>{quest.description}</p>

        {sciOpen && (
          <p className={styles.science} role="note">
            {quest.rationale || meta.science}
          </p>
        )}

        <div className={styles.progressRow}>
          <span
            className={styles.track}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={quest.target}
            aria-valuenow={quest.progress}
            aria-label={`${quest.title} progress`}
          >
            <span className={styles.fill} style={{ width: `${pct}%` }} />
          </span>
          <span className={styles.count}>
            {quest.progress}/{quest.target}
          </span>
        </div>
      </div>

      <div className={styles.action}>
        {flash ? (
          <span className={styles.flash} role="status">
            +{flash.xp} XP{flash.coins ? ` · +${flash.coins}` : ''}
          </span>
        ) : quest.claimed ? (
          <span className={styles.claimed}>
            +{quest.xp} XP
          </span>
        ) : quest.complete ? (
          <button type="button" className={styles.claimBtn} onClick={handleClaim}>
            Claim
          </button>
        ) : (
          <Link to={quest.to} className={styles.goBtn}>
            {quest.cta}
          </Link>
        )}
      </div>
    </li>
  );
}
