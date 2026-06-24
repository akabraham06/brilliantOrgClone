import { useEffect, useMemo, useState } from 'react';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import s from './MatchBoard.module.css';

/**
 * Reusable matching activity: tap a left item (a formula), then tap its match
 * on the right (a name). Tapping a matched left clears it; each right can only
 * be used once. Powers FormulaNameMatcher (content) and the matching check
 * (graded). Graded results and matches persist via savedState.
 */
export default function MatchBoard({
  pairs = [],
  graded = false,
  config = {},
  onReady,
  onResult,
  savedState,
  onSaveState,
}) {
  const [matches, setMatches] = useState(savedState?.matches || {});
  const [activeLeft, setActiveLeft] = useState(null);
  const [submitted, setSubmitted] = useState(savedState?.submitted || false);

  // Right options shown in a rotated order so they don't line up with left.
  const rightOptions = useMemo(() => {
    const rights = pairs.map((p) => p.right);
    return rights.length > 1 ? [...rights.slice(1), rights[0]] : rights;
  }, [pairs]);

  useEffect(() => {
    if (!graded) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allMatched = pairs.length > 0 && pairs.every((p) => matches[p.left] != null);
  const allCorrect = pairs.every((p) => matches[p.left] === p.right);
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
    onResult?.(allCorrect);
    onSaveState?.({ matches, submitted: true });
  }

  function reset() {
    setSubmitted(false);
    setMatches({});
    setActiveLeft(null);
    onResult?.(false);
    onSaveState?.({ matches: {}, submitted: false });
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={s.board}>
        <div className={s.col}>
          {pairs.map((p) => {
            const matched = matches[p.left];
            const isCorrect = submitted && matched === p.right;
            const isWrong = submitted && matched != null && matched !== p.right;
            let cls = `${v.chip} ${s.left}`;
            if (activeLeft === p.left) cls += ` ${v.chipSelected}`;
            if (isCorrect) cls += ` ${s.correct}`;
            if (isWrong) cls += ` ${s.wrong}`;
            return (
              <button key={p.left} type="button" className={cls} onClick={() => tapLeft(p.left)} disabled={submitted}>
                <span className={s.formula}><Formula value={p.left} /></span>
                {matched && <span className={s.matchedTo}>{matched}</span>}
              </button>
            );
          })}
        </div>
        <div className={s.col}>
          {rightOptions.map((right) => {
            const owner = rightToLeft[right];
            return (
              <button
                key={right}
                type="button"
                className={`${v.chip} ${s.right} ${owner ? s.used : ''}`}
                onClick={() => pickRight(right)}
                disabled={submitted || (owner != null && activeLeft == null)}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>

      {!submitted && (
        <p className={v.muted}>
          {activeLeft != null ? 'Now tap its match on the right.' : 'Tap a formula, then tap its name. Tap a matched formula to clear it.'}
        </p>
      )}

      {graded &&
        (submitted ? (
          <div className={allCorrect ? v.feedbackOk : v.feedbackBad}>
            <p>{allCorrect ? config.feedbackCorrect : config.feedbackIncorrect}</p>
            {!allCorrect && config.hint && <p>Hint: {config.hint}</p>}
            <button type="button" className={v.btn} onClick={reset} style={{ marginTop: 8 }}>
              Try again
            </button>
          </div>
        ) : (
          <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={submit} disabled={!allMatched}>
            Check answer
          </button>
        ))}
    </div>
  );
}
