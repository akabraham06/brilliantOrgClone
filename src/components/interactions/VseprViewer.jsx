import { useEffect, useState } from 'react';
import Scene3D from './lib/Scene3D.jsx';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import s from './VseprViewer.module.css';

// Tetrahedral frame with one vertex pointing up (methane orientation).
const TOP = [0, 1, 0];
const B0 = [0.9428, -0.3333, 0];
const B1 = [-0.4714, -0.3333, 0.8165];
const B2 = [-0.4714, -0.3333, -0.8165];

/**
 * Each shape is keyed by how many electron domains surround the central atom
 * and how many of those are lone pairs. Bonds and lone pairs both occupy real
 * 3D directions so the molecular shape that remains is geometrically correct.
 */
const SHAPES = {
  linear: { name: 'Linear', angle: '180\u00b0', example: 'CO2', central: 'C', terminal: 'O', bonds: [[1, 0, 0], [-1, 0, 0]], lone: [] },
  trigonal: { name: 'Trigonal planar', angle: '120\u00b0', example: 'BF3', central: 'B', terminal: 'F', bonds: [[1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]], lone: [] },
  tetrahedral: { name: 'Tetrahedral', angle: '109.5\u00b0', example: 'CH4', central: 'C', terminal: 'H', bonds: [TOP, B0, B1, B2], lone: [] },
  pyramidal: { name: 'Trigonal pyramidal', angle: '107\u00b0', example: 'NH3', central: 'N', terminal: 'H', bonds: [B0, B1, B2], lone: [TOP] },
  bent: { name: 'Bent', angle: '104.5\u00b0', example: 'H2O', central: 'O', terminal: 'H', bonds: [B1, B2], lone: [TOP, B0] },
};
const ORDER = ['linear', 'trigonal', 'tetrahedral', 'pyramidal', 'bent'];

const DIST = 66;
const toDeg = (rad) => (rad * 180) / Math.PI;

/**
 * CSS transform that aims a left-anchored bar from the origin toward dir.
 * Atoms are placed in screen space (CSS +Y points down), so the vertical
 * component is negated to match the atom positions.
 */
function stickTransform([x, y, z]) {
  const sy = -y;
  const ay = toDeg(Math.atan2(-z, x));
  const az = toDeg(Math.asin(Math.max(-1, Math.min(1, sy))));
  return `rotateY(${ay}deg) rotateZ(${az}deg)`;
}

export default function VseprViewer({ onReady, savedState, onSaveState }) {
  const [shapeKey, setShapeKey] = useState(savedState?.shapeKey || 'tetrahedral');
  const [showLone, setShowLone] = useState(savedState?.showLone ?? true);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shape = SHAPES[shapeKey];

  function pick(next) {
    setShapeKey(next);
    onSaveState?.({ shapeKey: next, showLone });
  }
  function toggleLone() {
    const next = !showLone;
    setShowLone(next);
    onSaveState?.({ shapeKey, showLone: next });
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose a shape">
        {ORDER.map((key) => (
          <button key={key} type="button" className={shapeKey === key ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => pick(key)}>
            {SHAPES[key].name}
          </button>
        ))}
      </div>

      <Scene3D height={236} label={`3D model of ${shape.name} geometry (${shape.example})`}>
        <div className={s.geo}>
          {/* bonds */}
          {shape.bonds.map((dir, i) => (
            <div key={`stick-${i}`} className={s.stick} style={{ width: DIST, transform: stickTransform(dir) }} />
          ))}

          {/* lone-pair "clouds" */}
          {showLone &&
            shape.lone.map((dir, i) => (
              <div
                key={`lone-${i}`}
                className={s.lone}
                style={{ transform: `translate3d(${dir[0] * (DIST - 16)}px, ${-dir[1] * (DIST - 16)}px, ${dir[2] * (DIST - 16)}px)` }}
              >
                <span />
                <span />
              </div>
            ))}

          {/* terminal atoms */}
          {shape.bonds.map((dir, i) => (
            <div
              key={`atom-${i}`}
              className={s.atom}
              style={{
                width: 34,
                height: 34,
                background: `radial-gradient(circle at 32% 30%, #fff, ${i % 2 ? 'var(--accent-blue)' : 'var(--accent-green)'} 44%, rgba(0,0,0,0.55))`,
                transform: `translate3d(${dir[0] * DIST}px, ${-dir[1] * DIST}px, ${dir[2] * DIST}px)`,
              }}
            >
              {shape.terminal}
            </div>
          ))}

          {/* central atom (origin) */}
          <div
            className={`${s.atom} ${s.center}`}
            style={{
              width: 46,
              height: 46,
              background: 'radial-gradient(circle at 32% 30%, #fff, var(--accent-purple) 44%, rgba(0,0,0,0.55))',
              transform: 'translate3d(0,0,0)',
            }}
          >
            {shape.central}
          </div>
        </div>
      </Scene3D>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue}>{shape.angle}</div>
          <div className={v.statLabel}>bond angle</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{shape.bonds.length}</div>
          <div className={v.statLabel}>bonded atoms</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{shape.lone.length}</div>
          <div className={v.statLabel}>lone pairs</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}><Formula value={shape.example} /></div>
          <div className={v.statLabel}>example</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={showLone ? `${v.btn} ${v.btnPrimary}` : v.btn} onClick={toggleLone}>
          {showLone ? 'Hide lone pairs' : 'Show lone pairs'}
        </button>
      </div>

      <p className={v.muted}>
        {shape.lone.length > 0
          ? `Drag to rotate. ${shape.name}: ${shape.lone.length} lone pair${shape.lone.length > 1 ? 's' : ''} take up room too and push the bonds closer together, narrowing the angle to about ${shape.angle}.`
          : `Drag to rotate. With ${shape.bonds.length} bonding pairs and no lone pairs, the atoms spread as far apart as possible - a ${shape.name.toLowerCase()} shape at ${shape.angle}.`}
      </p>
    </div>
  );
}
