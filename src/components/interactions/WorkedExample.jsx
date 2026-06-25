import { useCallback, useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './WorkedExample.module.css';

/**
 * Reusable "I do" worked example: models a procedure one revealed step at a
 * time, then states the key idea. Pairs with a "you try" check on the next
 * slide. Non-gating once every step is revealed.
 *
 * interactionConfig:
 *   { problem, steps: [{ label, detail }], takeaway }
 */
export default function WorkedExample({ slide, onReady, savedState, onSaveState }) {
  const cfg = slide?.interactionConfig || {};
  const steps = cfg.steps || [];
  const [revealed, setRevealed] = useState(() =>
    Math.min(savedState?.revealed ?? 1, steps.length || 1),
  );

  const done = revealed >= steps.length;

  useEffect(() => {
    if (done) onReady?.();
  }, [done, onReady]);

  useEffect(() => {
    onSaveState?.({ revealed });
  }, [revealed, onSaveState]);

  const revealNext = useCallback(() => {
    setRevealed((r) => Math.min(r + 1, steps.length));
  }, [steps.length]);

  return (
    <div className={v.stage}>
      <div className={v.panel}>
        {cfg.problem && (
          <p className={s.problem}>
            <span className={s.problemTag}>Problem</span>
            {cfg.problem}
          </p>
        )}
        <ol className={s.steps}>
          {steps.slice(0, revealed).map((step, i) => (
            <li key={i} className={s.step}>
              <span className={s.num} aria-hidden="true">
                {i + 1}
              </span>
              <span className={s.stepText}>
                <span className={s.stepLabel}>{step.label}</span>
                {step.detail && <span className={s.stepDetail}>{step.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
        <span className="sr-only" role="status" aria-live="polite">
          {steps[revealed - 1]
            ? `Step ${revealed}: ${steps[revealed - 1].label}. ${steps[revealed - 1].detail || ''}`
            : ''}
        </span>
      </div>

      {!done ? (
        <button type="button" className={v.btnPrimary} onClick={revealNext}>
          Reveal next step ({revealed}/{steps.length})
        </button>
      ) : (
        cfg.takeaway && (
          <p className={v.feedbackOk} role="status">
            <strong>Key idea:</strong> {cfg.takeaway}
          </p>
        )
      )}
    </div>
  );
}
