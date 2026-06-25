import { useEffect } from 'react';
import v from './viz.module.css';
import s from './KeyTakeaways.module.css';

/**
 * End-of-lesson recap: renders the lesson's key takeaways as an animated,
 * checked-off list. Non-gating - it marks the slide ready on mount so the
 * learner can continue to the quiz.
 */
export default function KeyTakeaways({ slide, onReady }) {
  const points = slide?.interactionConfig?.points || [];

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className={v.stage}>
      <ul className={s.list} aria-label="Key takeaways from this lesson">
        {points.map((point, i) => (
          <li key={i} className={s.item} style={{ animationDelay: `${i * 90}ms` }}>
            <span className={s.check} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={s.text}>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
