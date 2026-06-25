import { useMemo, useState } from 'react';
import v from './viz.module.css';
import s from './ElementIdCard.module.css';
import {
  motion,
  AnimatePresence,
  ReducedMotionConfig,
  revealVariants,
  placeSpring,
} from './lib/Motion.jsx';

/**
 * "An atomic number is an element's ID" - a tap-to-identify objective.
 *
 * The learner is shown a row of clean ID-card badges, each stamped with an
 * atomic number, and is asked to point out (tap) the one that matches the
 * named element. The reveal hammers the single idea: the proton count alone
 * fixes the element's identity - it never changes from one element to another.
 *
 * Marked ready (Next unlocks) once the learner taps the correct badge.
 */
const DEFAULT_CARDS = [
  { z: 1, symbol: 'H', name: 'Hydrogen' },
  { z: 6, symbol: 'C', name: 'Carbon' },
  { z: 8, symbol: 'O', name: 'Oxygen' },
];

export default function ElementIdCard({ slide, onReady }) {
  const cfg = slide?.interactionConfig || {};
  const cards = cfg.cards || DEFAULT_CARDS;
  const target = useMemo(
    () => cards.find((c) => c.z === cfg.targetZ) || cards[1] || cards[0],
    [cards, cfg.targetZ],
  );

  const [picked, setPicked] = useState(null);
  const solved = picked != null && picked === target.z;

  function pick(z) {
    if (solved) return;
    setPicked(z);
    if (z === target.z) onReady?.();
  }

  const missed = picked != null && picked !== target.z;

  return (
    <ReducedMotionConfig>
      <div className={v.stage} style={{ width: '100%', gap: 'var(--space-4)' }}>
        <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', textAlign: 'center', margin: 0 }}>
          Tap the ID badge for <span style={{ color: 'var(--accent-blue)' }}>{target.name}</span>.
        </p>

        <div className={s.row}>
          {cards.map((c) => {
            const isTarget = c.z === target.z;
            const isPicked = picked === c.z;
            const showCorrect = solved && isTarget;
            const showWrong = isPicked && !isTarget;
            return (
              <motion.button
                key={c.z}
                type="button"
                className={`${s.card} ${showCorrect ? s.correct : ''} ${showWrong ? s.wrong : ''}`}
                onClick={() => pick(c.z)}
                disabled={solved}
                whileHover={solved ? undefined : { y: -4 }}
                animate={{ opacity: solved && !isTarget ? 0.4 : 1 }}
                transition={{ duration: 0.25 }}
                aria-pressed={isPicked}
              >
                <span className={s.label}>ATOMIC NUMBER</span>
                <span className={s.z}>{c.z}</span>
                <span className={s.sym}>{showCorrect ? `= ${c.symbol}, ${c.name}` : '\u00A0'}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {missed && (
            <motion.p
              key="missed"
              className={v.muted}
              style={{ textAlign: 'center', margin: 0 }}
              role="status"
              variants={revealVariants}
              initial="hidden"
              animate="shown"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              Not that one - look for atomic number {target.z}.
            </motion.p>
          )}
          {solved && (
            <motion.div
              key="ok"
              className={v.feedbackOk}
              style={{ maxWidth: 460, textAlign: 'center' }}
              variants={revealVariants}
              initial="hidden"
              animate="shown"
              transition={placeSpring}
              role="status"
            >
              <p style={{ fontWeight: 700, margin: 0 }}>That is the one.</p>
              <p style={{ margin: '6px 0 0' }}>
                {target.z} protons is <strong>always</strong> {target.name} - the atomic number is the
                element&rsquo;s unchangeable ID.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReducedMotionConfig>
  );
}
