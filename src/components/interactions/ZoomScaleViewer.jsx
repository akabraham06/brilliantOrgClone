import { useEffect, useRef, useState } from 'react';
import v from './viz.module.css';
import z from './ZoomScaleViewer.module.css';

const STAGES = [
  { label: 'Drop of water', detail: 'What you can see', render: (key) => <circle key={key} cx="150" cy="80" r="55" fill="rgba(96,165,250,0.3)" stroke="var(--accent-blue)" /> },
  { label: 'Many molecules', detail: 'Too small to see', render: (key) => (
    <g key={key}>
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={60 + (i % 4) * 60} cy={40 + Math.floor(i / 4) * 40} r="10" fill="rgba(96,165,250,0.5)" />
      ))}
    </g>
  ) },
  { label: 'One molecule (H2O)', detail: 'A few atoms bonded', render: (key) => (
    <g key={key}>
      <line x1="150" y1="80" x2="118" y2="98" stroke="var(--color-border-strong)" strokeWidth="4" />
      <line x1="150" y1="80" x2="182" y2="98" stroke="var(--color-border-strong)" strokeWidth="4" />
      <circle cx="150" cy="80" r="22" fill="var(--accent-pink)" />
      <circle cx="118" cy="98" r="13" fill="#e9edf7" />
      <circle cx="182" cy="98" r="13" fill="#e9edf7" />
    </g>
  ) },
  { label: 'One atom', detail: 'The building block', render: (key) => (
    <g key={key}>
      <circle cx="150" cy="80" r="48" fill="none" stroke="var(--color-border-strong)" />
      <circle cx="150" cy="80" r="16" fill="rgba(251,146,60,0.3)" stroke="var(--accent-orange)" />
      <circle cx="198" cy="80" r="5" fill="var(--accent-blue)" />
    </g>
  ) },
];

/**
 * Zoom from a visible object down to a single atom. Moving the slider crossfades
 * the stages with a magnify effect: the outgoing layer scales up and fades out
 * (as if we pushed past it) while the incoming layer grows in from small - so it
 * reads like one continuous zoom-in.
 */
export default function ZoomScaleViewer({ onReady }) {
  const [stage, setStage] = useState(0);
  const [prev, setPrev] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function changeStage(next) {
    if (next === stage) return;
    setPrev(stage);
    setStage(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPrev(null), 520);
  }

  const s = STAGES[stage];
  const goingDeeper = prev != null && stage > prev;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap}>
        <svg viewBox="0 0 300 160" className={v.svg} role="img" aria-label={s.label}>
          <defs>
            <radialGradient id="zoom-lens" cx="50%" cy="50%" r="62%">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.32" />
            </radialGradient>
          </defs>

          {prev != null && prev !== stage && (
            <g key={`p${prev}`} className={goingDeeper ? z.zoomOut : z.zoomBack}>
              {STAGES[prev].render('p')}
            </g>
          )}
          <g key={`c${stage}`} className={goingDeeper ? z.zoomIn : z.zoomInBack}>
            {s.render('c')}
          </g>

          {/* lens vignette to suggest looking through a magnifier */}
          <rect x="0" y="0" width="300" height="160" fill="url(#zoom-lens)" pointerEvents="none" />
        </svg>
      </div>
      <div className={v.readout}>
        <div className={v.stat}>
          <div key={s.label} className={z.readoutFade}>
            <div className={v.statValue} style={{ fontSize: 'var(--text-lg)' }}>{s.label}</div>
            <div className={v.statLabel}>{s.detail}</div>
          </div>
        </div>
      </div>
      <input
        className={v.slider}
        type="range"
        min={0}
        max={STAGES.length - 1}
        value={stage}
        onChange={(e) => changeStage(Number(e.target.value))}
        aria-label="Zoom level"
      />
      <p className={v.muted}>Slide to zoom in - everything is built from atoms.</p>
    </div>
  );
}
