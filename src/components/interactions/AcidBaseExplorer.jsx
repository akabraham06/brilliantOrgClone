import { useEffect, useState } from 'react';
import v from './viz.module.css';

/*
 * An open-ended acid/base explorer (not a graded sort). Pick a common substance
 * and an indicator; the beaker shows the resulting indicator colour, the
 * acid / neutral / base classification, an approximate pH, and a short property
 * note (sour & reactive vs slippery & bitter).
 */

const SUBSTANCES = [
  { id: 'lemon', name: 'Lemon juice', ph: 2, type: 'acid', note: 'Tastes sour and reacts with metals - a fairly strong everyday acid.' },
  { id: 'vinegar', name: 'Vinegar', ph: 3, type: 'acid', note: 'Sour weak acid used in cooking; gives a sharp tang.' },
  { id: 'water', name: 'Pure water', ph: 7, type: 'neutral', note: 'Neither sour nor slippery - equal H\u207A and OH\u207B, perfectly balanced.' },
  { id: 'baking', name: 'Baking soda', ph: 9, type: 'base', note: 'Slightly bitter and slippery; a mild base that neutralizes acids.' },
  { id: 'soap', name: 'Soap', ph: 10, type: 'base', note: 'Feels slippery and tastes bitter - a classic property of bases.' },
  { id: 'ammonia', name: 'Ammonia', ph: 11, type: 'base', note: 'Slippery with a sharp smell; a strong household base.' },
];

const INDICATORS = ['Litmus', 'Universal'];

const TYPE_META = {
  acid: { label: 'Acid', color: 'var(--accent-red)' },
  neutral: { label: 'Neutral', color: 'var(--accent-green)' },
  base: { label: 'Base', color: 'var(--accent-blue)' },
};

function litmusColor(type) {
  if (type === 'acid') return '#ef4444';
  if (type === 'base') return '#60a5fa';
  return '#a78bfa';
}

function universalColor(ph) {
  if (ph <= 3) return '#ef4444';
  if (ph <= 5) return '#f97316';
  if (ph === 6) return '#a3e635';
  if (ph === 7) return '#4ade80';
  if (ph <= 9) return '#22d3ee';
  if (ph <= 11) return '#60a5fa';
  return '#a78bfa';
}

export default function AcidBaseExplorer({ onReady }) {
  const [subId, setSubId] = useState('lemon');
  const [indicator, setIndicator] = useState('Universal');

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sub = SUBSTANCES.find((x) => x.id === subId) || SUBSTANCES[0];
  const meta = TYPE_META[sub.type];
  const fill = indicator === 'Litmus' ? litmusColor(sub.type) : universalColor(sub.ph);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Explore:</strong> pick a substance and an indicator. Watch the colour, then read its
        classification, pH, and what it would feel or taste like.
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Substance">
        {SUBSTANCES.map((x) => (
          <button
            key={x.id}
            type="button"
            className={x.id === subId ? `${v.toggle} ${v.toggleActive}` : v.toggle}
            onClick={() => setSubId(x.id)}
            aria-pressed={x.id === subId}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Indicator">
        {INDICATORS.map((x) => (
          <button
            key={x}
            type="button"
            className={x === indicator ? `${v.toggle} ${v.toggleActive}` : v.toggle}
            onClick={() => setIndicator(x)}
            aria-pressed={x === indicator}
          >
            {x}
          </button>
        ))}
      </div>

      <div className={v.panel}>
        <div className={v.svgWrap} style={{ maxWidth: 240, margin: '0 auto' }}>
          <svg viewBox="0 0 200 200" className={v.svg} role="img" aria-label={`${sub.name} with ${indicator} indicator turns the solution ${meta.label.toLowerCase()}-coloured. Classified as ${meta.label}, about pH ${sub.ph}.`}>
            <defs>
              <radialGradient id="abx-shade" cx="34%" cy="26%" r="80%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
                <stop offset="45%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
              </radialGradient>
            </defs>
            {/* beaker */}
            <path d="M58 28 v14 l-10 130 a12 12 0 0 0 12 14 h80 a12 12 0 0 0 12 -14 l-10 -130 v-14" fill="none" stroke="var(--color-border-strong)" strokeWidth="2.5" />
            {/* liquid */}
            <path d="M52 92 l-3 80 a12 12 0 0 0 12 14 h80 a12 12 0 0 0 12 -14 l-3 -80 z" fill={fill} style={{ transition: 'fill 0.4s' }} />
            <path d="M52 92 l-3 80 a12 12 0 0 0 12 14 h80 a12 12 0 0 0 12 -14 l-3 -80 z" fill="url(#abx-shade)" />
            <ellipse cx="100" cy="92" rx="48" ry="6" fill={fill} stroke="rgba(0,0,0,0.18)" style={{ transition: 'fill 0.4s' }} />
          </svg>
        </div>
        <div className={v.sceneTitle} style={{ marginTop: 'var(--space-2)' }}>{indicator} indicator</div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: meta.color, fontSize: 'var(--text-xl)' }} role="status" aria-live="polite">{meta.label}</div>
          <div className={v.statLabel}>classification</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: meta.color }}>{sub.ph}</div>
          <div className={v.statLabel}>approx. pH</div>
        </div>
      </div>

      <p className={v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        <strong>{sub.name}:</strong> {sub.note}
      </p>
    </div>
  );
}
