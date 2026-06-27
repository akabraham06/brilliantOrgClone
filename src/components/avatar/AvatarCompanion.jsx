import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useEconomy } from '../../context/EconomyContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePrefersReducedMotion } from '../interactions/lib/motion.js';
import Avatar from './Avatar.jsx';
import styles from './AvatarCompanion.module.css';

const STORAGE_KEY = 'chem-companion-min';

// Routes where the companion stays out of the way. Heat Check is an immersive,
// full-viewport experience with its own treatment, so we hide there.
const HIDDEN_PATHS = ['/app/heat-check'];

// Short, friendly things the companion says when tapped. Kept generic so they
// always make sense regardless of what the learner is doing.
const GREETINGS = [
  'Lookin sharp today!',
  'Ready when you are.',
  'Nice fit — let us learn.',
  'Proud of your progress.',
  'One reaction at a time.',
  'You have got this.',
];

function readMinimized() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Persistent, characterful avatar "companion" anchored to the BOTTOM-RIGHT of
 * every authenticated page (the bottom-left is reserved for the AI tutor orb).
 * It wears the learner's currently equipped cosmetics — read live from
 * EconomyContext — so buying/equipping in the Store updates it instantly.
 *
 * Mounted once in AppLayout and portaled to <body> so it floats above page
 * content with a fixed anchor. The root is pointer-events:none; only the avatar
 * button and its controls are interactive, so it never blocks clicks on the UI
 * behind it. Tapping it plays a little hop and pops an encouraging greeting.
 *
 * Non-intrusive by design: it can be minimized to a tiny corner tab (remembered
 * in localStorage), auto-hides on the immersive Heat Check route, shrinks on
 * small screens, and stills all motion under prefers-reduced-motion. Always the
 * cheap SVG avatar — never a persistent three.js canvas.
 */
export default function AvatarCompanion() {
  const { economy, level } = useEconomy();
  const { user } = useAuth();
  const reduce = usePrefersReducedMotion();
  const location = useLocation();

  const [minimized, setMinimized] = useState(readMinimized);
  const [excited, setExcited] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const greetTimer = useRef(null);

  const firstName = useMemo(() => {
    const n = user?.displayName || user?.email?.split('@')[0] || 'Learner';
    return n.split(' ')[0];
  }, [user]);

  const persistMinimized = useCallback((next) => {
    setMinimized(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* storage may be unavailable (private mode); state still updates */
    }
  }, []);

  const hidden = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));

  // Occasional "perk up" so it feels alive without being distracting.
  useEffect(() => {
    if (reduce || minimized || hidden) return undefined;
    const id = window.setInterval(() => {
      setExcited(true);
      window.setTimeout(() => setExcited(false), 900);
    }, 14000);
    return () => window.clearInterval(id);
  }, [reduce, minimized, hidden]);

  useEffect(() => () => window.clearTimeout(greetTimer.current), []);

  const handleTap = useCallback(() => {
    if (!reduce) {
      setExcited(true);
      window.setTimeout(() => setExcited(false), 900);
    }
    const msg = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setGreeting(msg);
    window.clearTimeout(greetTimer.current);
    greetTimer.current = window.setTimeout(() => setGreeting(null), 3200);
  }, [reduce]);

  if (hidden) return null;

  if (minimized) {
    return createPortal(
      <div className={styles.root}>
        <button
          type="button"
          className={styles.peek}
          onClick={() => persistMinimized(false)}
          aria-label="Show your avatar companion"
          title="Show companion"
        >
          <Avatar equipped={economy.equipped} size={34} crop="bust" />
        </button>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className={styles.root}>
      <div className={`${styles.companion} ${reduce ? '' : styles.enter}`}>
        {greeting && (
          <div className={styles.bubble} role="status" aria-live="polite">
            <span className={styles.bubbleName}>{firstName}!</span> {greeting}
          </div>
        )}

        <button
          type="button"
          className={styles.dismiss}
          onClick={() => persistMinimized(true)}
          aria-label="Minimize your avatar companion"
          title="Minimize"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M4 8h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>

        <button
          type="button"
          className={`${styles.figure} ${reduce ? '' : styles.alive} ${
            excited && !reduce ? styles.excited : ''
          }`}
          onClick={handleTap}
          aria-label={`Your avatar companion, level ${level}. Tap for a hello.`}
        >
          <span className={styles.glow} aria-hidden="true" />
          <Avatar
            equipped={economy.equipped}
            size={96}
            idle
            className={styles.avatar}
          />
        </button>
      </div>
    </div>,
    document.body,
  );
}
