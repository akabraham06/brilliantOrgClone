import { useEffect, useMemo, useState } from 'react';
import { useRaf } from './lib/motion.js';
import v from './viz.module.css';

const VBW = 300;
const VBH = 170;
const ROWS = [0, 1, 2];
const COLS = [0, 1, 2, 3];

/**
 * Metallic bonding: fixed positive ions bathed in a mobile "sea" of electrons.
 * The electrons drift continuously; "Apply voltage" makes the whole sea flow in
 * one direction (conductivity), and "Push" slides the top layer of ions to show
 * malleability - the sea keeps the metal together either way.
 */
export default function MetallicBondScene({ onReady }) {
  const [pushed, setPushed] = useState(false);
  const [powered, setPowered] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useRaf((dt) => setPhase((p) => p + dt * 0.001));

  // Stable random-ish electron seeds.
  const electrons = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        bx: 18 + ((i * 53) % (VBW - 36)),
        by: 22 + ((i * 71) % (VBH - 44)),
        amp: 4 + (i % 4) * 2,
        sp: 0.6 + (i % 5) * 0.18,
        ph: i * 1.3,
      })),
    [],
  );

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className={v.svg} role="img" aria-label="Metal ions in a sea of mobile electrons">
          <defs>
            <radialGradient id="mb-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
            <linearGradient id="mb-sea" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(96,165,250,0.12)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0.10)" />
            </linearGradient>
          </defs>

          <rect x="4" y="4" width={VBW - 8} height={VBH - 8} rx="14" fill="url(#mb-sea)" stroke="var(--color-border)" />

          {/* electron sea */}
          {electrons.map((e, i) => {
            const flow = powered ? phase * 90 * e.sp : 0;
            const x = ((e.bx + flow + Math.sin(phase * e.sp + e.ph) * e.amp) % (VBW - 24)) + 12;
            const y = e.by + Math.cos(phase * e.sp * 0.8 + e.ph) * e.amp;
            return <circle key={i} cx={x} cy={y} r="3.4" fill="var(--accent-blue)" opacity="0.75" />;
          })}

          {/* positive metal ions in a lattice */}
          {ROWS.map((r) =>
            COLS.map((c) => {
              const shift = pushed && r === 0 ? 33 : 0;
              const cx = 48 + c * 68;
              const cy = 40 + r * 42;
              return (
                <g key={`${r}-${c}`} style={{ transition: 'transform 420ms cubic-bezier(0.4,1.2,0.5,1)' }} transform={`translate(${shift},0)`}>
                  <circle cx={cx} cy={cy} r="15" fill="var(--accent-purple)" />
                  <circle cx={cx} cy={cy} r="15" fill="url(#mb-shade)" />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#0e0f13">+</text>
                </g>
              );
            }),
          )}
        </svg>
      </div>

      <div className={v.row}>
        <button type="button" className={powered ? `${v.btn} ${v.btnPrimary}` : v.btn} onClick={() => setPowered((p) => !p)}>
          {powered ? 'Power off' : 'Apply voltage'}
        </button>
        <button type="button" className={pushed ? `${v.btn} ${v.btnPrimary}` : v.btn} onClick={() => setPushed((p) => !p)}>
          {pushed ? 'Release' : 'Push the metal'}
        </button>
      </div>

      <p className={v.muted}>
        {powered
          ? 'With a voltage applied, the whole electron sea drifts one way - that flow of charge is an electric current. Metals conduct.'
          : pushed
            ? 'The top layer slides over the others, but the electron sea flows around the ions and holds them together - so metals bend instead of shattering.'
            : 'Positive ions sit in a shared sea of electrons that drifts freely. Apply a voltage to make it flow, or push the metal to bend it.'}
      </p>
    </div>
  );
}
