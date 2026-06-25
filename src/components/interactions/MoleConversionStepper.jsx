import { useEffect, useMemo, useState } from 'react';
import v from './viz.module.css';

const AVOGADRO = 6.022e23;

/**
 * Two-phase grams -> moles conversion. First an interactive map of the journey
 * (grams -> divide by molar mass -> moles -> times Avogadro -> particles) with a
 * "Got it" button; pressing it fades the map out and reveals guided questions:
 *   1) pick the correct molar mass
 *   2) pick the correct setup (grams / molar mass)
 *   3) pick the final answer
 */
export default function MoleConversionStepper({ slide, onReady }) {
  const cfg = slide?.interactionConfig || {};
  const grams = cfg.grams ?? 36;
  const molarMass = cfg.molarMass ?? 18;
  const substance = cfg.substance ?? 'H\u2082O';
  const moles = grams / molarMass;

  const [phase, setPhase] = useState('intro');
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = useMemo(
    () => [
      {
        prompt: `What is the molar mass of ${substance}?`,
        options: [
          { label: `${molarMass} g/mol`, correct: true },
          { label: `${molarMass + 6} g/mol`, correct: false },
          { label: `${Math.round(molarMass / 2)} g/mol`, correct: false },
        ],
      },
      {
        prompt: 'How do you convert grams to moles?',
        options: [
          { label: 'grams \u00F7 molar mass', correct: true },
          { label: 'grams \u00D7 molar mass', correct: false },
          { label: 'molar mass \u00F7 grams', correct: false },
        ],
      },
      {
        prompt: `So ${grams} g \u00F7 ${molarMass} g/mol = ?`,
        options: [
          { label: `${moles} mol`, correct: true },
          { label: `${grams * molarMass} mol`, correct: false },
          { label: `${grams} mol`, correct: false },
        ],
      },
    ],
    [substance, molarMass, grams, moles],
  );

  const done = step >= steps.length;

  function choose(option) {
    if (option.correct) {
      setWrong(false);
      setStep((s) => s + 1);
    } else {
      setWrong(true);
    }
  }

  if (phase === 'intro') {
    return (
      <div className={`${v.stage} ${v.popIn}`} style={{ width: '100%' }}>
        <p className={v.muted} style={{ textAlign: 'center' }}>
          Every grams &harr; moles &harr; particles trip uses the same two bridges. Trace the path,
          then work out the numbers yourself.
        </p>
        <ConversionMap substance={substance} />
        <div className={v.row}>
          <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setPhase('quiz')}>
            Got it &mdash; let me try &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${v.stage} ${v.popIn}`} style={{ width: '100%' }}>
      <div className={v.row}>
        <PathNode label={`${grams} g`} active />
        <span aria-hidden="true">&rarr;</span>
        <PathNode label={`${moles} mol`} active={step >= 3} />
        <span aria-hidden="true">&rarr;</span>
        <PathNode label="particles" active={done} />
      </div>

      {!done ? (
        <>
          <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', textAlign: 'center' }}>{steps[step].prompt}</p>
          <div className={v.row}>
            {steps[step].options.map((o) => (
              <button key={o.label} type="button" className={v.btn} onClick={() => choose(o)}>
                {o.label}
              </button>
            ))}
          </div>
          {wrong && <p className={v.feedbackBad}>Not quite - try again.</p>}
          <p className={v.muted}>Step {step + 1} of {steps.length}</p>
        </>
      ) : (
        <div className={v.feedbackOk} role="status" aria-live="polite">
          <p>
            {grams} g of {substance} = <strong>{moles} mol</strong> ={' '}
            {(() => {
              const [mant, exp] = (moles * AVOGADRO).toExponential(2).split('e');
              return (
                <>
                  {mant} &times; 10<sup>{Number(exp)}</sup> particles.
                </>
              );
            })()}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Animated conversion map showing the PROCESS only - grams -> (/ molar mass) ->
 * moles -> (x Avogadro) -> particles - without the specific numbers, so it
 * doesn't spoil the questions the learner is about to attempt.
 */
function ConversionMap({ substance }) {
  const node = (label, sub, color) => (
    <div className={v.popIn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 72 }}>
      <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-lg)', fontWeight: 800, background: 'var(--color-bg-elevated)', border: `2px solid ${color}`, color }}>{label}</div>
      <div className={v.statLabel}>{sub}</div>
    </div>
  );
  const op = (text) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-subtle)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
      <span aria-hidden="true">&rarr;</span>
      <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  );
  return (
    <div className={v.row} style={{ alignItems: 'flex-start', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
      {node('grams', substance, 'var(--accent-orange)')}
      {op('\u00F7 molar mass')}
      {node('moles', 'moles', 'var(--accent-green)')}
      {op('\u00D7 Avogadro')}
      {node('particles', 'count', 'var(--accent-blue)')}
    </div>
  );
}

function PathNode({ label, active }) {
  return (
    <span
      style={{
        padding: '8px 14px',
        borderRadius: 'var(--radius-pill)',
        fontWeight: 700,
        border: `1px solid ${active ? 'var(--accent-green)' : 'var(--color-border-strong)'}`,
        background: active ? 'var(--color-correct-bg)' : 'var(--color-bg-elevated)',
        color: active ? 'var(--accent-green)' : 'var(--color-text-muted)',
        transition: 'all 0.4s',
      }}
    >
      {label}
    </span>
  );
}
