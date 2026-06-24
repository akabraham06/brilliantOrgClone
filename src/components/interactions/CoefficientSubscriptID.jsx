import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './CoefficientSubscriptID.module.css';

/**
 * A focused check: given a formula like 2H2O, the learner taps the coefficient,
 * then a subscript. Wrong taps prompt a try-again; identifying both correctly
 * satisfies the slide. Reinforces "coefficient = whole molecules, subscript =
 * atoms within one molecule".
 */
export default function CoefficientSubscriptID({ slide, onReady, savedState, onSaveState }) {
  const cfg = slide?.interactionConfig || {};
  const coefficient = cfg.coefficient || 2;
  const units = cfg.units || [
    { el: 'H', sub: 2 },
    { el: 'O', sub: 1 },
  ];

  const [step, setStep] = useState(savedState?.step ?? 0); // 0=coeff, 1=sub, 2=done
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    if ((savedState?.step ?? 0) >= 2) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap(kind) {
    if (step >= 2) return;
    const want = step === 0 ? 'coeff' : 'sub';
    if (kind === want) {
      const ns = step + 1;
      setStep(ns);
      setWrong(false);
      onSaveState?.({ step: ns });
      if (ns >= 2) onReady?.();
    } else {
      setWrong(true);
    }
  }

  const coeffFound = step >= 1;
  const subFound = step >= 2;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        {step === 0 && <><strong>Step 1:</strong> tap the <strong>coefficient</strong> - the number that multiplies whole molecules.</>}
        {step === 1 && <><strong>Step 2:</strong> now tap a <strong>subscript</strong> - a number that counts atoms inside one molecule.</>}
        {step >= 2 && <><strong>Nice!</strong> The big number in front is the coefficient; the small numbers after symbols are subscripts.</>}
      </div>

      <div className={s.formula} aria-label={`Formula ${coefficient} ${units.map((u) => u.el + u.sub).join(' ')}`}>
        <button
          type="button"
          className={`${s.token} ${s.coeff} ${coeffFound ? s.found : ''}`}
          onClick={() => tap('coeff')}
          disabled={coeffFound}
        >
          {coefficient}
        </button>
        {units.map((u, i) => (
          <span key={i} className={s.unit}>
            <span className={s.el}>{u.el}</span>
            {u.sub > 1 && (
              <button
                type="button"
                className={`${s.token} ${s.sub} ${subFound ? s.found : ''}`}
                onClick={() => tap('sub')}
                disabled={subFound}
              >
                {u.sub}
              </button>
            )}
          </span>
        ))}
      </div>

      {wrong && step < 2 && (
        <p className={v.feedbackBad} style={{ textAlign: 'center' }}>
          Not that one - {step === 0 ? 'the coefficient is the large number in front of the whole formula.' : 'a subscript is a small number just after an element symbol.'} Try again.
        </p>
      )}
      {step >= 2 && (
        <p className={v.feedbackOk} style={{ textAlign: 'center' }}>
          In {coefficient}{units.map((u) => u.el + (u.sub > 1 ? u.sub : '')).join('')}, the {coefficient} multiplies every atom, while each subscript stays inside one molecule.
        </p>
      )}
    </div>
  );
}
