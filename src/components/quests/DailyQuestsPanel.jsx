import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDailyQuests } from '../../context/DailyQuestsContext.jsx';
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

/**
 * Daily Quests panel. Renders the day's AI-personalized, performance-aware quests
 * with their learning-science rationale, live progress, a claim button when
 * complete, the total (capped) XP/coins available, and a reset countdown.
 *
 * Reuses theme tokens throughout and respects prefers-reduced-motion (all motion
 * is via --transition-* tokens, which collapse to 0ms under reduced motion).
 */
export default function DailyQuestsPanel({ className = '' }) {
  const { quests, totals, generating, aiEnabled, claim, allClaimed } = useDailyQuests();

  const [countdown, setCountdown] = useState(() => msUntilReset());
  useEffect(() => {
    const id = window.setInterval(() => setCountdown(msUntilReset()), 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className={`${styles.panel} ${className}`} aria-label="Daily quests">
      <header className={styles.head}>
        <div className={styles.titleRow}>
          <span className={styles.eyebrow}>Daily Quests</span>
          {aiEnabled && <span className={styles.aiTag}>AI</span>}
        </div>
        <span className={styles.countdown} title="Quests refresh at midnight">
          <span aria-hidden="true">&#9201;</span> Resets in {formatCountdown(countdown)}
        </span>
      </header>

      <p className={styles.blurb}>
        A small, personalized set built from how you&rsquo;ve been doing &mdash; tuned to make
        learning <strong>stick</strong>.
      </p>

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
    </section>
  );
}

function QuestRow({ quest, onClaim }) {
  const meta = PRINCIPLE_META[quest.principle] || {};
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
