import { useState } from 'react';
import v from './viz.module.css';

/**
 * "Predict, then reveal" with a check / try-again loop.
 *
 * The learner commits to a prediction. A wrong pick is dimmed with a gentle
 * "try another" nudge and the learner keeps going. The explanation is revealed
 * only once they either pick the correct option OR exhaust every wrong one - and
 * the slide is marked ready (Next unlocks) at exactly that moment.
 */
export default function PredictRevealCard({ slide, onReady }) {
  const cfg = slide?.interactionConfig || {};
  const prompt = cfg.prompt || 'What do you think happens?';
  const options = cfg.options || [
    { id: 'a', label: 'It disappears forever', correct: false },
    { id: 'b', label: 'It breaks into tiny particles spread through the water', correct: true },
    { id: 'c', label: 'It turns into a gas', correct: false },
  ];
  const reveal =
    cfg.reveal ||
    'It breaks apart into ions that spread evenly through the water - it is still there, just invisible.';

  const [tried, setTried] = useState([]); // ids the learner has already picked
  const [done, setDone] = useState(false); // correct OR all options exhausted
  const [gotItRight, setGotItRight] = useState(false);

  const wrongCount = options.filter((o) => !o.correct).length;

  function pick(o) {
    if (done || tried.includes(o.id)) return;
    const nextTried = [...tried, o.id];
    setTried(nextTried);

    if (o.correct) {
      setGotItRight(true);
      setDone(true);
      onReady?.();
      return;
    }
    // Every wrong option has now been tried -> reveal the explanation.
    const wrongTried = nextTried.filter((id) => !options.find((x) => x.id === id)?.correct);
    if (wrongTried.length >= wrongCount) {
      setDone(true);
      onReady?.();
    }
  }

  const justMissed = tried.length > 0 && !done;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', textAlign: 'center' }}>{prompt}</p>

      <div className={v.stage} style={{ gap: 'var(--space-2)', width: '100%', maxWidth: 460 }}>
        {options.map((o) => {
          const isTried = tried.includes(o.id);
          let cls = v.btn;
          let opacity = 1;
          if (done && o.correct) {
            cls = `${v.btn} ${v.chipActive}`; // reveal the right answer in purple
          } else if (isTried && !o.correct) {
            opacity = 0.45; // a wrong pick the learner already ruled out
          }
          return (
            <button
              key={o.id}
              type="button"
              className={cls}
              style={{ width: '100%', opacity }}
              onClick={() => pick(o)}
              disabled={done || isTried}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {justMissed && (
        <p className={v.muted} style={{ textAlign: 'center' }} role="status">
          Not quite - try another.
        </p>
      )}

      {done && (
        <div className={gotItRight ? v.feedbackOk : v.feedbackBad} style={{ maxWidth: 460 }}>
          <p style={{ fontWeight: 700 }}>
            {gotItRight ? 'Good prediction!' : 'Here is what really happens:'}
          </p>
          {cfg.image && (
            <img
              src={cfg.image}
              alt=""
              style={{ width: '100%', borderRadius: 'var(--radius-md)', margin: '8px 0' }}
            />
          )}
          <p>{reveal}</p>
        </div>
      )}
    </div>
  );
}
