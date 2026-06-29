import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiEnabled, generateJSON } from '../../firebase/ai.js';
import { useTutor } from '../../context/TutorContext.jsx';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { useLearnerProfile } from '../../ai/useLearnerProfile.js';
import { formatProfileForPrompt } from '../../ai/learnerProfile.js';
import {
  buildAnchoredExplainRequest,
  CONCISE_EXPLAIN_SCHEMA,
  DEEPER_EXPLAIN_SCHEMA,
} from '../../ai/anchoredExplain.js';
import { usePrefersReducedMotion } from '../interactions/lib/motion.js';
import TutorFeedback from './TutorFeedback.jsx';
import reading from './readingStyle.module.css';
import styles from './TutorAnchoredExplain.module.css';

const CARD_W = 320;
const GAP = 16; // space between the chosen answer and the card
const MARGIN = 10; // min viewport inset

// Approximate centre of the bottom-left launcher orb, used as the fly-in origin.
function orbOrigin() {
  return { x: 46, y: window.innerHeight - 46 };
}

/**
 * Picks where the card sits relative to the chosen-answer element. Prefers the
 * side with free space (left, then right) so it never covers the options or the
 * on-screen feedback; falls back to below the answer. Always clamped on-screen.
 */
function computePosition(anchorEl) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(CARD_W, vw - 2 * MARGIN);

  const rect = anchorEl?.getBoundingClientRect?.();
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    return { left: MARGIN, top: Math.max(MARGIN, vh - 360), placement: 'free', cardW };
  }

  let placement;
  let left;
  let top = rect.top;

  if (rect.left - cardW - GAP >= MARGIN) {
    placement = 'left';
    left = rect.left - cardW - GAP;
  } else if (rect.right + GAP + cardW <= vw - MARGIN) {
    placement = 'right';
    left = rect.right + GAP;
  } else {
    placement = 'bottom';
    left = rect.left;
    top = rect.bottom + GAP;
  }

  left = Math.max(MARGIN, Math.min(left, vw - cardW - MARGIN));
  // We don't know the card height up front; reserve room so it stays on-screen.
  top = Math.max(MARGIN, Math.min(top, vh - 160 - MARGIN));
  return { left, top, placement, cardW };
}

function samePos(a, b) {
  return (
    a &&
    b &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    a.placement === b.placement &&
    a.cardW === b.cardW
  );
}

/**
 * Global mount (next to TutorDot). When an assessment reports a fully-completed
 * attempt, this renders the tutor's anchored explanation card flying from the
 * launcher orb to beside the chosen answer, then showing a concise, stepped
 * explanation with an on-demand "Go deeper" breakdown. Self-gates on aiEnabled
 * and honors prefers-reduced-motion.
 */
export default function TutorAnchoredExplain() {
  const { anchoredExplain, dismissAnchoredExplain, openTutor } = useTutor();
  const reduce = usePrefersReducedMotion();

  if (!aiEnabled) return null;

  return createPortal(
    <AnimatePresence>
      {anchoredExplain && (
        <AnchoredCard
          key={anchoredExplain.id}
          data={anchoredExplain}
          reduce={reduce}
          onDismiss={dismissAnchoredExplain}
          openTutor={openTutor}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function AnchoredCard({ data, reduce, onDismiss, openTutor }) {
  const { anchorEl, context } = data;
  const profile = useLearnerProfile();
  const { prefs } = usePreferences();

  const [pos, setPos] = useState(() => computePosition(anchorEl));
  // The concise, stepped explanation: { headline, steps[], analogyRef? }.
  const [concise, setConcise] = useState(null);
  const [failed, setFailed] = useState(false);
  const [simplified, setSimplified] = useState(false);
  // On-demand "Go deeper" breakdown, cached so re-toggling never refetches.
  const [deeper, setDeeper] = useState(null);
  const [deeperOpen, setDeeperOpen] = useState(false);
  const [deeperLoading, setDeeperLoading] = useState(false);
  const [deeperFailed, setDeeperFailed] = useState(false);
  const startedRef = useRef(false);

  const measure = useCallback(() => {
    setPos((prev) => {
      const next = computePosition(anchorEl);
      return samePos(prev, next) ? prev : next;
    });
  }, [anchorEl]);

  // Initial placement before paint to avoid a flash at the wrong spot.
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Re-measure on scroll/resize, plus a short settle loop so the card stays
  // glued to the answer while the reveal/feedback block animates in below it.
  useEffect(() => {
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    const start = window.performance.now();
    let raf = window.requestAnimationFrame(function tick(t) {
      measure();
      if (t - start < 1000) raf = window.requestAnimationFrame(tick);
    });
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      window.cancelAnimationFrame(raf);
    };
  }, [measure]);

  // Re-clamp the card position when its height changes (concise arrives, or the
  // deeper section expands/collapses) so it never drifts off-screen.
  useEffect(() => {
    measure();
  }, [concise, deeperOpen, deeper, measure]);

  const activeRef = useRef(true);

  // Fetch the concise stepped explanation. `forceSimple` re-requests it with the
  // simpler-language instruction on, powering the "Rephrase simpler" action.
  const runConcise = useCallback(
    (forceSimple) => {
      setFailed(false);
      setConcise(null);
      const { system, prompt } = buildAnchoredExplainRequest({
        slide: context.slide,
        profileText: formatProfileForPrompt(profile),
        context,
        prefs: forceSimple ? { ...prefs, simpleLanguage: true } : prefs,
      });
      // Small budget: a short headline + 2-4 one-line steps keeps latency low.
      generateJSON(prompt, CONCISE_EXPLAIN_SCHEMA, { system, maxTokens: 320 }).then((res) => {
        if (!activeRef.current) return;
        if (res && Array.isArray(res.steps) && res.steps.length) setConcise(res);
        else setFailed(true);
      });
    },
    [context, profile, prefs],
  );

  // Fetch the concise explanation once on open.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    activeRef.current = true;
    runConcise(false);
    return () => {
      activeRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRephrase = useCallback(() => {
    setSimplified(true);
    // A simpler rephrase invalidates the cached deeper breakdown.
    setDeeper(null);
    setDeeperOpen(false);
    setDeeperFailed(false);
    runConcise(true);
  }, [runConcise]);

  // "Go deeper": collapse if already open; otherwise reveal the cached deeper
  // breakdown, or fetch it on first request (richer steps + larger budget).
  const onToggleDeeper = useCallback(() => {
    if (deeperOpen) {
      setDeeperOpen(false);
      return;
    }
    if (deeper || deeperLoading) {
      setDeeperOpen(true);
      return;
    }
    setDeeperOpen(true);
    setDeeperLoading(true);
    setDeeperFailed(false);
    const { system, prompt } = buildAnchoredExplainRequest({
      slide: context.slide,
      profileText: formatProfileForPrompt(profile),
      context,
      prefs: simplified ? { ...prefs, simpleLanguage: true } : prefs,
      deeper: true,
    });
    generateJSON(prompt, DEEPER_EXPLAIN_SCHEMA, { system, maxTokens: 640 }).then((res) => {
      if (!activeRef.current) return;
      setDeeperLoading(false);
      if (res && Array.isArray(res.steps) && res.steps.length) setDeeper(res);
      else setDeeperFailed(true);
    });
  }, [deeperOpen, deeper, deeperLoading, context, profile, prefs, simplified]);

  const { initial, animate, exit } = useMemo(() => {
    if (reduce) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }
    const o = orbOrigin();
    return {
      initial: {
        opacity: 0,
        scale: 0.28,
        x: o.x - pos.left,
        y: o.y - pos.top,
        borderRadius: 40,
      },
      animate: { opacity: 1, scale: 1, x: 0, y: 0, borderRadius: 16 },
      exit: { opacity: 0, scale: 0.85, y: 8 },
    };
    // Origin only matters for the entrance; recomputing on every pos tweak would
    // restart the fly-in, so we intentionally freeze it to the first placement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const headline = context.isCorrect ? "Nice — here's the deeper why" : "Let's unpack that";
  const followUp = context.isCorrect
    ? 'Tell me more about this idea.'
    : 'Can you explain my mistake in more detail?';

  return (
    <motion.div
      className={styles.card}
      style={{ left: pos.left, top: pos.top, width: pos.cardW }}
      data-placement={pos.placement}
      role="dialog"
      aria-label="Tutor explanation"
      initial={initial}
      animate={animate}
      exit={exit}
      transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 230, damping: 26 }}
    >
      <div className={styles.head}>
        <span className={`${styles.orb} ${reduce ? '' : styles.orbAlive}`} aria-hidden="true" />
        <span className={styles.title}>{headline}</span>
        <button
          type="button"
          className={styles.close}
          onClick={onDismiss}
          aria-label="Dismiss explanation"
        >
          &times;
        </button>
      </div>

      <div className={styles.body}>
        {failed ? (
          <p className={styles.text}>
            I couldn&rsquo;t load an explanation just now. Re-read the on-screen feedback, or open
            the tutor to ask.
          </p>
        ) : concise ? (
          <div className={`${styles.explain} ${reading.readingText}`}>
            <p className={styles.explainHead}>{concise.headline}</p>
            <ol className={styles.steps}>
              {concise.steps.map((step, i) => (
                <li key={i} className={styles.step}>
                  <span className={styles.stepNum} aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className={styles.stepText}>{step}</span>
                </li>
              ))}
            </ol>
            {concise.analogyRef && (
              <p className={styles.analogyRef}>
                <span aria-hidden="true">&#8617;</span> {concise.analogyRef}
              </p>
            )}
          </div>
        ) : (
          <span className={styles.thinking} aria-live="polite">
            <span className={styles.dots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            Thinking it through&hellip;
          </span>
        )}
      </div>

      {concise && !failed && (
        <AnimatePresence initial={false}>
          {deeperOpen && (
            <motion.div
              key="deeper"
              className={styles.deeper}
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={reduce ? { duration: 0.12 } : { duration: 0.24, ease: 'easeOut' }}
            >
              {deeperLoading ? (
                <span className={styles.thinking} aria-live="polite">
                  <span className={styles.dots} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  Going deeper&hellip;
                </span>
              ) : deeperFailed ? (
                <p className={styles.text}>
                  I couldn&rsquo;t load the full breakdown. Try again, or open the tutor to ask.
                </p>
              ) : deeper ? (
                <div className={`${styles.explain} ${reading.readingText}`}>
                  <p className={styles.deeperLabel}>Full breakdown</p>
                  <p className={styles.explainHead}>{deeper.headline}</p>
                  <ol className={styles.steps}>
                    {deeper.steps.map((step, i) => (
                      <li key={i} className={styles.step}>
                        <span className={styles.stepNum} aria-hidden="true">
                          {i + 1}
                        </span>
                        <span className={styles.stepText}>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {deeper.misconception && (
                    <p className={styles.misconception}>
                      <span className={styles.misconceptionTag}>Watch out</span>
                      {deeper.misconception}
                    </p>
                  )}
                  {deeper.analogyRef && (
                    <p className={styles.analogyRef}>
                      <span aria-hidden="true">&#8617;</span> {deeper.analogyRef}
                    </p>
                  )}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {concise && !failed && <TutorFeedback surface="anchored" slideId={context.slide?.slideId} />}

      <div className={styles.actions}>
        {concise && !failed && (
          <button
            type="button"
            className={styles.secondary}
            onClick={onToggleDeeper}
            aria-expanded={deeperOpen}
          >
            {deeperOpen ? 'Hide breakdown' : 'Go deeper'}
          </button>
        )}
        {concise && !failed && !simplified && (
          <button type="button" className={styles.secondary} onClick={onRephrase}>
            Rephrase simpler
          </button>
        )}
        <button
          type="button"
          className={styles.more}
          onClick={() => {
            onDismiss();
            openTutor(followUp);
          }}
        >
          Ask a follow-up &rarr;
        </button>
      </div>
    </motion.div>
  );
}
