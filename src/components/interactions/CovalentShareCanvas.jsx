import { useEffect, useMemo, useRef, useState } from 'react';
import Sphere from './lib/Sphere.jsx';
import Scene3D from './lib/Scene3D.jsx';
import { useRaf } from './lib/motion.js';
import { atomColor } from './formula.js';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import styles from './CovalentShareCanvas.module.css';

// Each molecule: a center atom + outer atoms; each connection needs N shared
// pairs (1 = single, 2 = double). geo = 3D coords for the rotatable view.
const MOLECULES = {
  H2: {
    center: { symbol: 'H', x: 110, y: 90 },
    atoms: [{ symbol: 'H', x: 200, y: 90, pairs: 1 }],
    note: 'Two hydrogens share one pair - a single covalent bond.',
    geo: [
      { symbol: 'H', p: [-34, 0, 0], r: 16 },
      { symbol: 'H', p: [34, 0, 0], r: 16 },
    ],
  },
  H2O: {
    center: { symbol: 'O', x: 150, y: 70 },
    atoms: [
      { symbol: 'H', x: 80, y: 130, pairs: 1 },
      { symbol: 'H', x: 220, y: 130, pairs: 1 },
    ],
    note: 'Oxygen shares one pair with each hydrogen - a bent molecule.',
    geo: [
      { symbol: 'O', p: [0, -18, 0], r: 22 },
      { symbol: 'H', p: [-38, 26, 0], r: 15 },
      { symbol: 'H', p: [38, 26, 0], r: 15 },
    ],
  },
  CO2: {
    center: { symbol: 'C', x: 150, y: 90 },
    atoms: [
      { symbol: 'O', x: 65, y: 90, pairs: 2 },
      { symbol: 'O', x: 235, y: 90, pairs: 2 },
    ],
    note: 'Carbon shares two pairs with each oxygen - linear O=C=O.',
    geo: [
      { symbol: 'C', p: [0, 0, 0], r: 20 },
      { symbol: 'O', p: [-48, 0, 0], r: 18 },
      { symbol: 'O', p: [48, 0, 0], r: 18 },
    ],
  },
};

export default function CovalentShareCanvas({ slide, onReady }) {
  const initial = slide?.interactionConfig?.molecule;
  const svgRef = useRef(null);
  const [name, setName] = useState(MOLECULES[initial] ? initial : 'H2');
  const [counts, setCounts] = useState({});
  const [drag, setDrag] = useState({});
  const dragIdx = useRef(null);
  const [mode, setMode] = useState('lines'); // 'lines' | 'dots'
  const [geo, setGeo] = useState(false);
  const [phase, setPhase] = useState(0);

  useRaf((dt) => setPhase((p) => p + dt * 0.002), mode === 'dots' && !geo);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = MOLECULES[name];
  const c = m.center;
  const complete = useMemo(() => m.atoms.every((a, i) => (counts[i] || 0) >= a.pairs), [counts, m]);

  function selectMolecule(next) {
    setName(next);
    setCounts({});
    setDrag({});
    setGeo(false);
  }
  function loosePos(a) {
    const dx = a.x - c.x;
    const dy = a.y - c.y;
    const L = Math.hypot(dx, dy) || 1;
    return { x: a.x + (dx / L) * 22, y: a.y + (dy / L) * 22 };
  }
  function renderPos(a, i) {
    if (drag[i]) return drag[i];
    return (counts[i] || 0) > 0 ? { x: a.x, y: a.y } : loosePos(a);
  }
  function addPair(i) {
    setCounts((prev) => {
      const target = m.atoms[i].pairs;
      const cur = prev[i] || 0;
      return { ...prev, [i]: cur >= target ? 0 : cur + 1 };
    });
  }
  function toVb(e) {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 300, y: ((e.clientY - rect.top) / rect.height) * 180 };
  }
  function down(i, e) {
    dragIdx.current = i;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function moveAtom(e) {
    const i = dragIdx.current;
    if (i == null) return;
    setDrag((d) => ({ ...d, [i]: toVb(e) }));
  }
  function upAtom() {
    const i = dragIdx.current;
    if (i == null) return;
    dragIdx.current = null;
    const a = m.atoms[i];
    const p = drag[i];
    setDrag((d) => {
      const next = { ...d };
      delete next[i];
      return next;
    });
    if (!p) return;
    const distNow = Math.hypot(p.x - c.x, p.y - c.y);
    const restDist = Math.hypot(a.x - c.x, a.y - c.y);
    if (distNow < restDist - 10) {
      setCounts((prev) => ({ ...prev, [i]: a.pairs })); // snap-bond to full
    }
  }

  if (geo) {
    return (
      <div className={v.stage} style={{ width: '100%' }}>
        <GeometryView molecule={m} />
        <div className={v.row}>
          <button type="button" className={v.btn} onClick={() => setGeo(false)}>Back to builder</button>
        </div>
        <p className={v.muted}>Drag to rotate and see the real shape of <Formula value={name} />.</p>
      </div>
    );
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose molecule">
        {Object.keys(MOLECULES).map((key) => (
          <button key={key} type="button" className={name === key ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => selectMolecule(key)}>
            <Formula value={key} />
          </button>
        ))}
      </div>

      <div className={v.svgWrap}>
        <svg ref={svgRef} viewBox="0 0 300 180" className={v.svg} style={{ touchAction: 'none' }} role="img" aria-label={`Build ${name}`}>
          {m.atoms.map((a, i) => {
            const count = counts[i] || 0;
            const p = renderPos(a, i);
            const dx = p.x - c.x;
            const dy = p.y - c.y;
            const len = Math.hypot(dx, dy) || 1;
            const px = -dy / len;
            const py = dx / len;
            const satisfied = count >= a.pairs;
            const mx = (c.x + p.x) / 2;
            const my = (c.y + p.y) / 2;
            return (
              <g key={i}>
                {/* clickable bond region (tap fallback to add a pair) */}
                <line x1={c.x} y1={c.y} x2={p.x} y2={p.y} stroke="transparent" strokeWidth="24" style={{ cursor: 'pointer' }} onClick={() => addPair(i)} />

                {mode === 'lines'
                  ? Array.from({ length: count }).map((_, k) => {
                      const off = (k - (count - 1) / 2) * 6;
                      return (
                        <line key={k} className={styles.bond} x1={c.x + px * off} y1={c.y + py * off} x2={p.x + px * off} y2={p.y + py * off} stroke={satisfied ? 'var(--accent-green)' : 'var(--accent-yellow)'} strokeWidth="3" />
                      );
                    })
                  : Array.from({ length: count }).map((_, k) => {
                      // Lewis dot pair, gently orbiting the bond midpoint
                      const ang = phase + k * 1.2;
                      const ox = Math.cos(ang) * 6;
                      const oy = Math.sin(ang) * 6;
                      return (
                        <g key={k}>
                          <circle cx={mx + px * (k * 7 - 3) + ox} cy={my + py * (k * 7 - 3) + oy} r="3" fill="var(--accent-blue)" />
                          <circle cx={mx + px * (k * 7 - 3) - ox} cy={my + py * (k * 7 - 3) - oy} r="3" fill="var(--accent-blue)" />
                        </g>
                      );
                    })}

                <g onPointerDown={(e) => down(i, e)} onPointerMove={moveAtom} onPointerUp={upAtom} onPointerCancel={upAtom} style={{ cursor: 'grab' }}>
                  <Sphere cx={p.x} cy={p.y} r={a.symbol === 'H' ? 18 : 22} color={atomColor(a.symbol)} glow={satisfied} ariaLabel={`${a.symbol} atom`} />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fontWeight="800" fill="#0e0f13" pointerEvents="none">{a.symbol}</text>
                </g>
              </g>
            );
          })}
          <Sphere cx={c.x} cy={c.y} r={24} color={atomColor(c.symbol)} glow={complete} ariaLabel={`${c.symbol} atom`} />
          <text x={c.x} y={c.y + 5} textAnchor="middle" fontWeight="800" fill="#0e0f13" pointerEvents="none">{c.symbol}</text>
        </svg>
      </div>

      <div className={v.row}>
        <div className={v.toggleGroup} role="group" aria-label="Bond display">
          <button type="button" className={mode === 'lines' ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setMode('lines')}>Lines</button>
          <button type="button" className={mode === 'dots' ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setMode('dots')}>Lewis dots</button>
        </div>
        {complete && (
          <button type="button" className={v.btn} onClick={() => setGeo(true)}>Rotate molecule</button>
        )}
      </div>

      <p className={complete ? v.feedbackOk : v.muted}>
        {complete ? (
          <>
            <Formula value={name} /> complete! {m.note}
          </>
        ) : (
          'Drag an atom toward the center to bond it, or tap the bond to add a shared pair.'
        )}
      </p>
    </div>
  );
}

/** Rotatable ball-and-stick geometry of the molecule (CSS 3D). */
function GeometryView({ molecule }) {
  const center = molecule.geo[0];
  return (
    <Scene3D height={230} label={`Rotatable 3D model of ${molecule.center.symbol} molecule`}>
      <div className={styles.geo}>
        {molecule.geo.slice(1).map((atom, i) => {
          const dx = atom.p[0] - center.p[0];
          const dy = atom.p[1] - center.p[1];
          const len = Math.hypot(dx, dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <div
              key={`stick${i}`}
              className={styles.stick}
              style={{ width: len, transform: `translate3d(${center.p[0]}px, ${center.p[1]}px, ${center.p[2]}px) rotate(${angle}deg)` }}
            />
          );
        })}
        {molecule.geo.map((atom, i) => (
          <div
            key={i}
            className={styles.geoAtom}
            style={{
              width: atom.r * 2,
              height: atom.r * 2,
              marginLeft: -atom.r,
              marginTop: -atom.r,
              background: `radial-gradient(circle at 32% 30%, #fff, ${atomColor(atom.symbol)} 42%, rgba(0,0,0,0.55))`,
              transform: `translate3d(${atom.p[0]}px, ${atom.p[1]}px, ${atom.p[2]}px)`,
            }}
          >
            {atom.symbol}
          </div>
        ))}
      </div>
    </Scene3D>
  );
}
