import { useEffect, useMemo, useState } from 'react';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import { useStruggleReporter } from '../tutor/useStruggleReporter.js';

/**
 * Build a compound's name from word blocks. Tap blocks to add them to the name
 * in order; tap a chosen block to remove it. Works ungraded (content practice)
 * or graded (check) - correct when the chosen blocks match `answer` exactly.
 */
export default function CompoundNameBuilder({ slide, graded = false, config = {}, onReady, onResult, savedState, onSaveState }) {
  const data = graded ? config : slide?.interactionConfig || {};
  const formula = data.formula || 'NaCl';
  const answer = data.answer || ['sodium', 'chloride'];
  const blocks = useMemo(
    () => data.blocks || ['sodium', 'chlorine', 'chloride', 'monoxide', 'nitrate'],
    [data.blocks],
  );

  const [chosen, setChosen] = useState(savedState?.chosen || []);
  const [submitted, setSubmitted] = useState(savedState?.submitted || false);

  const reportStruggle = useStruggleReporter({
    enabled: graded,
    slideId: slide?.slideId,
    hintSeed:
      'I\u2019m stuck naming this compound \u2014 can you give me one small hint for the next step?',
  });

  useEffect(() => {
    if (!graded) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const correct =
    chosen.length === answer.length && chosen.every((c, i) => c === answer[i]);

  function addBlock(b) {
    if (submitted) return;
    setChosen((prev) => {
      const next = [...prev, b];
      onSaveState?.({ chosen: next, submitted: false });
      return next;
    });
  }
  function removeAt(i) {
    if (submitted) return;
    setChosen((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      onSaveState?.({ chosen: next, submitted: false });
      return next;
    });
  }
  function submit() {
    setSubmitted(true);
    onResult?.(correct);
    onSaveState?.({ chosen, submitted: true });
    reportStruggle(correct, {
      event: {
        prompt: `Name the compound ${formula} by choosing word blocks in order.`,
        selected: chosen.length ? `they built: ${chosen.join(' ')}` : 'no name built yet',
      },
    });
  }
  function reset() {
    setSubmitted(false);
    setChosen([]);
    onResult?.(false);
    onSaveState?.({ chosen: [], submitted: false });
  }

  // For ungraded practice, surface correctness inline once the name is full.
  const showInline = !graded && chosen.length === answer.length;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}><Formula value={formula} /></div>

      <div
        className={v.row}
        style={{
          minHeight: 56,
          width: '100%',
          maxWidth: 420,
          border: '1px dashed var(--color-border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
        }}
        aria-label="Your compound name"
      >
        {chosen.length === 0 ? (
          <span className={v.muted}>Tap blocks below to build the name</span>
        ) : (
          chosen.map((c, i) => (
            <button key={`${c}-${i}`} type="button" className={`${v.chip} ${v.chipSelected}`} onClick={() => removeAt(i)}>
              {c}
            </button>
          ))
        )}
      </div>

      <div className={v.row}>
        {blocks.map((b) => (
          <button key={b} type="button" className={v.chip} onClick={() => addBlock(b)} disabled={submitted}>
            {b}
          </button>
        ))}
      </div>

      {graded ? (
        submitted ? (
          <div className={correct ? v.feedbackOk : v.feedbackBad}>
            <p>{correct ? config.feedbackCorrect || 'Correct!' : config.feedbackIncorrect || 'Not quite.'}</p>
            {!correct && config.hint && <p>Hint: {config.hint}</p>}
            <button type="button" className={v.btn} onClick={reset} style={{ marginTop: 8 }}>Try again</button>
          </div>
        ) : (
          <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={submit} disabled={chosen.length === 0}>
            Check answer
          </button>
        )
      ) : (
        showInline && (
          <p className={correct ? v.feedbackOk : v.feedbackBad}>
            {correct ? `Correct - ${formula} is "${answer.join(' ')}".` : 'Close - tap a block to remove it and try a different order.'}
          </p>
        )
      )}
    </div>
  );
}
