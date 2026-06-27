import { useEffect, useMemo, useState } from 'react';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import s from './MatchBoard.module.css';
import { useStruggleReporter } from '../tutor/useStruggleReporter.js';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  ReducedMotionConfig,
  placeSpring,
  revealVariants,
} from './lib/Motion.jsx';

// Graded reveal: each left chip fades up in a short stagger (opacity only, so
// it never fights the layout transform that reflows the board).
const leftReveal = {
  idle: { opacity: 1 },
  graded: (idx) => ({ opacity: [0.5, 1], transition: { delay: idx * 0.06, duration: 0.35 } }),
};

/**
 * Reusable matching activity: tap a left item (a formula), then tap its match
 * on the right (a name). Tapping a matched left clears it; each right can only
 * be used once. Powers FormulaNameMatcher (content) and the matching check
 * (graded). Graded results and matches persist via savedState.
 */
export default function MatchBoard({
  pairs = [],
  graded = false,
  validated = false,
  autoValidate = false,
  config = {},
  onReady,
  onResult,
  savedState,
  onSaveState,
}) {
  const [matches, setMatches] = useState(savedState?.matches || {});
  const [activeLeft, setActiveLeft] = useState(null);
  const [submitted, setSubmitted] = useState(savedState?.submitted || false);

  const reportStruggle = useStruggleReporter({
    enabled: graded,
    hintSeed:
      'I\u2019m stuck matching these \u2014 can you give me one small hint for the next step?',
  });

  // Right options shown in a rotated order so they don't line up with left.
  const rightOptions = useMemo(() => {
    const rights = pairs.map((p) => p.right);
    return rights.length > 1 ? [...rights.slice(1), rights[0]] : rights;
  }, [pairs]);

  useEffect(() => {
    // Ungraded content matching auto-completes on mount. Validated matching
    // gates Next on a correct submit (like a graded check) but unlocks via
    // onReady - so re-fire it if a previously-correct submit was restored.
    if (!graded && !validated && !autoValidate) {
      onReady?.();
    } else if (autoValidate) {
      const restored = savedState?.matches || {};
      if (pairs.length > 0 && pairs.every((p) => restored[p.left] === p.right)) onReady?.();
    } else if (validated && savedState?.submitted) {
      const restored = savedState.matches || {};
      if (pairs.length > 0 && pairs.every((p) => restored[p.left] === p.right)) onReady?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allMatched = pairs.length > 0 && pairs.every((p) => matches[p.left] != null);
  const allCorrect = pairs.length > 0 && pairs.every((p) => matches[p.left] === p.right);

  // Auto-validating matching needs no Check button: once every formula has a
  // name, it grades itself. A fully-correct board unlocks Next; a wrong pair is
  // flagged inline and the learner just taps it to clear and retry.
  const autoEvaluated = autoValidate && allMatched;
  useEffect(() => {
    if (autoValidate && allCorrect) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoValidate, allCorrect]);
  const rightToLeft = useMemo(() => {
    const map = {};
    Object.entries(matches).forEach(([left, right]) => {
      map[right] = left;
    });
    return map;
  }, [matches]);

  function pickRight(right) {
    if (activeLeft == null || submitted) return;
    setMatches((prev) => {
      const next = { ...prev };
      // A right can only belong to one left: free it from any prior owner.
      Object.keys(next).forEach((l) => {
        if (next[l] === right) delete next[l];
      });
      next[activeLeft] = right;
      onSaveState?.({ matches: next, submitted: false });
      return next;
    });
    setActiveLeft(null);
  }

  function tapLeft(left) {
    if (submitted) return;
    if (matches[left] != null) {
      setMatches((prev) => {
        const next = { ...prev };
        delete next[left];
        onSaveState?.({ matches: next, submitted: false });
        return next;
      });
      setActiveLeft(null);
      return;
    }
    setActiveLeft((cur) => (cur === left ? null : left));
  }

  function submit() {
    setSubmitted(true);
    if (graded) onResult?.(allCorrect);
    if (validated && allCorrect) onReady?.();
    onSaveState?.({ matches, submitted: true });
    if (graded) {
      const wrong = pairs
        .filter((p) => matches[p.left] !== p.right)
        .map((p) => p.left)
        .join(', ');
      reportStruggle(allCorrect, {
        event: {
          prompt: config.prompt || 'Match each item on the left to its pair on the right.',
          selected: wrong ? `still mismatched: ${wrong}` : 'incorrect matches',
        },
      });
    }
  }

  function reset() {
    setSubmitted(false);
    setMatches({});
    setActiveLeft(null);
    onResult?.(false);
    onSaveState?.({ matches: {}, submitted: false });
  }

  return (
    <ReducedMotionConfig>
      <LayoutGroup>
        <div className={v.stage} style={{ width: '100%' }}>
          <div className={s.board}>
            <div className={s.col}>
              {pairs.map((p, idx) => {
                const matched = matches[p.left];
                const evaluated = submitted || autoEvaluated;
                const isCorrect = evaluated && matched === p.right;
                const isWrong = evaluated && matched != null && matched !== p.right;
                let cls = `${v.chip} ${s.left}`;
                if (activeLeft === p.left) cls += ` ${v.chipSelected}`;
                if (isCorrect) cls += ` ${s.correct}`;
                if (isWrong) cls += ` ${s.wrong}`;
                return (
                  <motion.button
                    key={p.left}
                    type="button"
                    className={cls}
                    onClick={() => tapLeft(p.left)}
                    disabled={submitted}
                    layout
                    custom={idx}
                    variants={leftReveal}
                    animate={submitted ? 'graded' : 'idle'}
                  >
                    <span className={s.formula}><Formula value={p.left} /></span>
                    {/* The chosen name snaps in under the formula (a drawn "↳"
                        connector) the moment the pair is formed. */}
                    <AnimatePresence mode="popLayout">
                      {matched && (
                        <motion.span
                          key={matched}
                          className={s.matchedTo}
                          initial={{ opacity: 0, scale: 0.6, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={placeSpring}
                        >
                          <span aria-hidden="true" style={{ marginRight: 4 }}>&#8627;</span>
                          {matched}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
            <div className={s.col}>
              {rightOptions.map((right) => {
                const owner = rightToLeft[right];
                return (
                  <motion.button
                    key={right}
                    type="button"
                    className={`${v.chip} ${s.right} ${owner ? s.used : ''}`}
                    onClick={() => pickRight(right)}
                    disabled={submitted || (owner != null && activeLeft == null)}
                    layout
                    transition={placeSpring}
                  >
                    {right}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {!submitted && !autoEvaluated && (
            <p className={v.muted}>
              {activeLeft != null ? 'Now tap its match on the right.' : 'Tap a formula, then tap its name. Tap a matched formula to clear it.'}
            </p>
          )}

          <AnimatePresence mode="wait">
            {autoValidate && autoEvaluated && (
              <motion.div
                key="auto"
                className={allCorrect ? v.feedbackOk : v.feedbackBad}
                variants={revealVariants}
                initial="hidden"
                animate="shown"
                exit="exit"
                transition={placeSpring}
              >
                <p>{allCorrect ? config.feedbackCorrect : (config.feedbackIncorrect || 'Not quite - tap a highlighted formula to clear it and try a different name.')}</p>
                {!allCorrect && config.hint && <p>Hint: {config.hint}</p>}
              </motion.div>
            )}
            {(graded || validated) &&
              (submitted ? (
                <motion.div
                  key="feedback"
                  className={allCorrect ? v.feedbackOk : v.feedbackBad}
                  variants={revealVariants}
                  initial="hidden"
                  animate="shown"
                  exit="exit"
                  transition={placeSpring}
                >
                  <p>{allCorrect ? config.feedbackCorrect : config.feedbackIncorrect}</p>
                  {!allCorrect && config.hint && <p>Hint: {config.hint}</p>}
                  <button type="button" className={v.btn} onClick={reset} style={{ marginTop: 8 }}>
                    Try again
                  </button>
                </motion.div>
              ) : (
                <button key="check" type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={submit} disabled={!allMatched}>
                  Check answer
                </button>
              ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </ReducedMotionConfig>
  );
}
