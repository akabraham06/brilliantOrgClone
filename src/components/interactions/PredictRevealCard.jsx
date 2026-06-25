import { useState } from 'react';
import v from './viz.module.css';
import {
  motion,
  AnimatePresence,
  ReducedMotionConfig,
  revealVariants,
  placeSpring,
} from './lib/Motion.jsx';

/**
 * "Predict, then reveal" with a check / try-again loop.
 *
 * The learner commits to a prediction. A wrong pick is dimmed with a gentle
 * "try another" nudge and the learner keeps going. The explanation is revealed
 * only once they either pick the correct option OR exhaust every wrong one - and
 * the slide is marked ready (Next unlocks) at exactly that moment.
 *
 * Framer Motion is layered on purely as visual sugar: the reveal block slides /
 * fades in via AnimatePresence the moment it unlocks, and a ruled-out wrong pick
 * dims and gets a drawn cross-out. All of it is wrapped in <ReducedMotionConfig>
 * so the same prediction / reveal logic runs identically with motion disabled.
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
    <ReducedMotionConfig>
      <div className={v.stage} style={{ width: '100%' }}>
        <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', textAlign: 'center' }}>{prompt}</p>

        <div className={v.stage} style={{ gap: 'var(--space-2)', width: '100%', maxWidth: 460 }}>
          {options.map((o) => {
            const isTried = tried.includes(o.id);
            const ruledOut = isTried && !o.correct;
            let cls = v.btn;
            if (done && o.correct) {
              cls = `${v.btn} ${v.chipActive}`; // reveal the right answer in purple
            }
            return (
              <motion.button
                key={o.id}
                type="button"
                className={cls}
                style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
                onClick={() => pick(o)}
                disabled={done || isTried}
                animate={{ opacity: ruledOut ? 0.45 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <span>{o.label}</span>
                {/* A cross-out that draws across a ruled-out wrong pick. Under
                    reduced motion the scaleX transform is dropped and it simply
                    appears (opacity), so the "this is wrong" cue still lands. */}
                <AnimatePresence>
                  {ruledOut && (
                    <motion.span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 'var(--space-5)',
                        right: 'var(--space-5)',
                        top: '50%',
                        height: 2,
                        transformOrigin: 'left center',
                        background: 'var(--color-text-subtle)',
                        pointerEvents: 'none',
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: 'easeOut' }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {justMissed && (
            <motion.p
              key="missed"
              className={v.muted}
              style={{ textAlign: 'center' }}
              role="status"
              variants={revealVariants}
              initial="hidden"
              animate="shown"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              Not quite - try another.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {done && (
            <motion.div
              key="reveal"
              className={gotItRight ? v.feedbackOk : v.feedbackBad}
              style={{ maxWidth: 460 }}
              variants={revealVariants}
              initial="hidden"
              animate="shown"
              exit="exit"
              transition={placeSpring}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReducedMotionConfig>
  );
}
