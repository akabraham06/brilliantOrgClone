/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import Viewport3D from './lib/Viewport3D.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Dissolving as mixing at the particle level. A salt crystal sits clustered as
 * an ordered 3x3x3 lattice of alternating ions. Press "Stir" and the ions break
 * out of the lattice and spread evenly through the liquid (the surrounding box).
 * Built on three.js instanced spheres so the dispersal is genuinely 3D.
 */

const NA_HEX = '#a78bfa';
const CL_HEX = '#4ade80';
const SPACING = 0.52;
const BOUNDS = [2.3, 1.4, 2.3];

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Crystal (clustered) home + a dispersed target for each ion. Computed once.
function buildIons() {
  const rng = mulberry32(99);
  const ions = [];
  for (let i = 0; i < 3; i += 1)
    for (let j = 0; j < 3; j += 1)
      for (let k = 0; k < 3; k += 1) {
        const isNa = (i + j + k) % 2 === 0;
        ions.push({
          key: `${i}-${j}-${k}`,
          crystal: [(i - 1) * SPACING, (j - 1) * SPACING, (k - 1) * SPACING],
          dispersed: [
            (rng() * 2 - 1) * BOUNDS[0],
            (rng() * 2 - 1) * BOUNDS[1],
            (rng() * 2 - 1) * BOUNDS[2],
          ],
          color: isNa ? NA_HEX : CL_HEX,
          scale: isNa ? 0.34 : 0.46,
          phase: rng() * Math.PI * 2,
        });
      }
  return ions;
}

const IONS = buildIons();
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function AnimatedIons({ stirred }) {
  const refs = useRef([]);
  const tRef = useRef(stirred ? 1 : 0);

  useFrame((state, delta) => {
    const target = stirred ? 1 : 0;
    const dt = Math.min(delta, 0.05);
    tRef.current += (target - tRef.current) * Math.min(1, dt * 2.2);
    const t = ease(tRef.current);
    const time = state.clock.elapsedTime;
    for (let i = 0; i < IONS.length; i += 1) {
      const ion = IONS[i];
      const ref = refs.current[i];
      if (!ref) continue;
      // gentle drift once dispersed, so the solution looks alive
      const wander = 0.12 * tRef.current;
      ref.position.set(
        lerp(ion.crystal[0], ion.dispersed[0], t) + Math.sin(time * 1.3 + ion.phase) * wander,
        lerp(ion.crystal[1], ion.dispersed[1], t) + Math.cos(time * 1.1 + ion.phase) * wander,
        lerp(ion.crystal[2], ion.dispersed[2], t) + Math.sin(time * 1.5 + ion.phase) * wander,
      );
    }
  });

  return <IonInstances refs={refs} />;
}

function StaticIons({ stirred }) {
  return <IonInstances positions={stirred ? 'dispersed' : 'crystal'} />;
}

function IonInstances({ refs, positions }) {
  return (
    <Instances limit={IONS.length} range={IONS.length}>
      <sphereGeometry args={[1, 20, 20]} />
      <meshStandardMaterial roughness={0.35} metalness={0.05} />
      {IONS.map((ion, i) => (
        <Instance
          key={ion.key}
          ref={refs ? (el) => { refs.current[i] = el; } : undefined}
          position={positions ? ion[positions] : ion.crystal}
          scale={ion.scale}
          color={ion.color}
        />
      ))}
    </Instances>
  );
}

function GlassBox() {
  return (
    <mesh>
      <boxGeometry args={[BOUNDS[0] * 2, BOUNDS[1] * 2, BOUNDS[2] * 2]} />
      <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.22} />
    </mesh>
  );
}

export default function DissolveSim({ onReady }) {
  const [stirred, setStirred] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> stir to dissolve. The ordered crystal breaks into ions that spread evenly
        through the liquid - nothing is lost, it is just mixed too finely to see.
      </div>

      <div className={`${v.panel} ${v.panelWide}`}>
        <Viewport3D
          height={250}
          autoRotate
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          label={stirred
            ? 'Salt ions dispersed evenly throughout the liquid in a 3D container.'
            : 'A salt crystal: an ordered 3D lattice of alternating ions, not yet dissolved.'}
        >
          <GlassBox />
          {reduce ? <StaticIons stirred={stirred} /> : <AnimatedIons stirred={stirred} />}
        </Viewport3D>
        <div className={v.sceneTitle} style={{ marginTop: 'var(--space-2)' }}>
          {stirred ? 'Dissolved - ions spread through the liquid' : 'Crystal - ions locked in a lattice'}
        </div>
      </div>

      <div className={v.legend}>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: NA_HEX }} />Na&#8314; ion</span>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: CL_HEX }} />Cl&#8315; ion</span>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setStirred((s) => !s)} aria-pressed={stirred}>
          {stirred ? 'Reset crystal' : 'Stir to dissolve'}
        </button>
      </div>

      <p className={v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        {stirred
          ? 'Dissolved: the ions are spread evenly, so every sip is equally salty.'
          : 'The crystal holds its ions in a rigid lattice - stir to pull them into solution.'}
      </p>
    </div>
  );
}
