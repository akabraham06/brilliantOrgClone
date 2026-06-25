import { useEffect, useState } from 'react';
import { useSpring, useRaf } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Water as the universal solvent. Tap "Add salt" and the NaCl crystal breaks
 * into Na+ and Cl- ions that drift out into the water, each wrapped by polar
 * water molecules. Ions animate smoothly from their lattice spots to dispersed
 * positions, with pseudo-3D shading for depth.
 */

const WATER = Array.from({ length: 12 }).map((_, i) => ({
  x: 28 + (i % 6) * 44,
  y: 56 + Math.floor(i / 6) * 56,
}));

// Each ion has a packed (crystal) spot and a dispersed spot it drifts toward.
const IONS = [
  { id: 0, label: 'Na', sign: '+', color: 'var(--accent-purple)', from: [138, 78], to: [70, 64] },
  { id: 1, label: 'Cl', sign: '\u2212', color: 'var(--accent-green)', from: [162, 78], to: [232, 70] },
  { id: 2, label: 'Na', sign: '+', color: 'var(--accent-purple)', from: [138, 102], to: [150, 122] },
  { id: 3, label: 'Cl', sign: '\u2212', color: 'var(--accent-green)', from: [162, 102], to: [250, 118] },
  { id: 4, label: 'Na', sign: '+', color: 'var(--accent-purple)', from: [150, 90], to: [196, 56] },
  { id: 5, label: 'Cl', sign: '\u2212', color: 'var(--accent-green)', from: [126, 90], to: [60, 120] },
];

const lerp = (a, b, t) => a + (b - a) * t;

export default function WaterRoleScene({ onReady }) {
  const [dissolved, setDissolved] = useState(false);
  const [phase, setPhase] = useState(0);
  // `t` lives in [0,1], so the default pixel-scale threshold (0.4) would make
  // the spring snap once it got within 0.4 of its target - a visible jolt at
  // ~0.6. A tiny threshold plus a softer stiffness lets it ease all the way in,
  // settling smoothly over ~1s. Reduced motion still snaps instantly (handled
  // inside useSpring).
  const t = useSpring(dissolved ? 1 : 0, { stiffness: 0.07, threshold: 0.004 });

  // Continuous ambient motion so the scene feels alive even before dissolving:
  // water molecules jiggle and freed ions bob gently. Self-gated for reduced motion.
  useRaf((dt) => setPhase((p) => p + dt * 0.0016));

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={`${v.panel} ${v.panelWide}`}>
        <svg viewBox="0 0 300 170" className={v.svg} role="img" aria-label={dissolved ? 'Salt dissolved into ions in water' : 'Salt crystal in water'}>
          <defs>
            <radialGradient id="wr-shade" cx="34%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
            </radialGradient>
          </defs>

          <path d="M 12 34 H 288 V 140 Q 288 158 150 158 Q 12 158 12 140 Z" fill="rgba(96,165,250,0.14)" stroke="var(--color-border-strong)" strokeWidth="2" />

          {WATER.map((w, i) => (
            <g key={`w${i}`} style={{ transform: `translate(${Math.sin(phase * 1.3 + i) * 2.2}px, ${Math.cos(phase + i * 1.7) * 2.2}px)` }}>
              <circle cx={w.x} cy={w.y} r="6" fill="rgba(96,165,250,0.45)" />
              <circle cx={w.x} cy={w.y} r="6" fill="url(#wr-shade)" />
            </g>
          ))}

          {/* crystal outline fades as it breaks apart */}
          <rect x="128" y="68" width="44" height="44" rx="5" fill="none" stroke="var(--color-text)" strokeWidth="1.5" opacity={1 - t} />

          {IONS.map((ion) => {
            // Gentle continuous bob layered on the dissolve interpolation; the
            // wobble grows once the ions are freed and drifting in water.
            const bob = (0.6 + t) * 1.8;
            const x = lerp(ion.from[0], ion.to[0], t) + Math.sin(phase * 1.1 + ion.id) * bob;
            const y = lerp(ion.from[1], ion.to[1], t) + Math.cos(phase * 0.9 + ion.id * 1.3) * bob;
            const r = 12;
            return (
              <g key={ion.id}>
                {/* Hydration shell: polar water molecules cluster around each
                    freed ion as it disperses (shows what the copy describes). */}
                {t > 0.05 &&
                  [0, 1, 2].map((k) => {
                    const ang = (k / 3) * Math.PI * 2 + ion.id;
                    const rr = r + 8;
                    return (
                      <circle
                        key={k}
                        cx={x + Math.cos(ang) * rr}
                        cy={y + Math.sin(ang) * rr}
                        r="3.4"
                        fill="rgba(96,165,250,0.75)"
                        opacity={t}
                      />
                    );
                  })}
                <circle cx={x} cy={y} r={r} fill={ion.color} stroke="rgba(0,0,0,0.28)" />
                <circle cx={x} cy={y} r={r} fill="url(#wr-shade)" />
                <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0e0f13">{ion.label}{ion.sign}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setDissolved((d) => !d)}>
          {dissolved ? 'Reset crystal' : 'Add salt'}
        </button>
      </div>

      <p className={v.muted} style={{ textAlign: 'center' }}>
        {dissolved
          ? 'Water pulls the crystal apart into Na+ and Cl- ions and surrounds each one - that is why water is the "universal solvent".'
          : 'A salt crystal sits in water. Add it and watch water tear it into ions.'}
      </p>
    </div>
  );
}
