/* eslint-disable react/no-unknown-property -- react-three-fiber intrinsics use three.js props (position, args, ...) */
import { useEffect, useMemo, useState } from 'react';
import { Vector3, Quaternion } from 'three';
import Viewport3D from './lib/Viewport3D.jsx';
import { useRaf, usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

/**
 * Where a reaction's energy actually comes from - the bonds. Building directly
 * on the previous slide ("breaking bonds absorbs energy, forming bonds releases
 * it"), this steps a real reaction through three stages in 3D:
 *   1. Reactants (intact bonds)
 *   2. Break every reactant bond  -> energy ABSORBED (energy in)
 *   3. Form every product bond     -> energy RELEASED (energy out)
 * A running ledger tallies energy in vs. out using real bond energies, and the
 * net decides exothermic (more released) vs. endothermic (more absorbed) - the
 * quantitative "why" behind slide 15's energy diagram, not a repeat of it.
 */

const GEO_UP = new Vector3(0, 1, 0);
const ELEM = {
  H: { c: '#e9edf7', r: 0.3 },
  Cl: { c: '#4ade80', r: 0.52 },
  Br: { c: '#f59e0b', r: 0.56 },
};

const REACTIONS = {
  exo: {
    name: 'H\u2082 + Cl\u2082 \u2192 2 HCl',
    atoms: [
      { id: 'H1', el: 'H' },
      { id: 'H2', el: 'H' },
      { id: 'Cl1', el: 'Cl' },
      { id: 'Cl2', el: 'Cl' },
    ],
    broken: [{ label: 'H\u2013H', e: 436 }, { label: 'Cl\u2013Cl', e: 243 }],
    formed: [{ label: 'H\u2013Cl', e: 432 }, { label: 'H\u2013Cl', e: 432 }],
    reactantBonds: [['H1', 'H2'], ['Cl1', 'Cl2']],
    productBonds: [['H1', 'Cl1'], ['H2', 'Cl2']],
    layout: [
      { H1: [-2.3, 0.55, 0], H2: [-1.5, 0.55, 0], Cl1: [1.5, -0.55, 0], Cl2: [2.3, -0.55, 0] },
      { H1: [-2.7, 1.15, 0], H2: [-1.1, 1.15, 0], Cl1: [1.1, -1.15, 0], Cl2: [2.7, -1.15, 0] },
      { H1: [-1.75, 0.15, 0], Cl1: [-0.95, 0.15, 0], H2: [0.95, 0.15, 0], Cl2: [1.75, 0.15, 0] },
    ],
  },
  endo: {
    name: '2 HBr \u2192 H\u2082 + Br\u2082',
    atoms: [
      { id: 'H1', el: 'H' },
      { id: 'Br1', el: 'Br' },
      { id: 'H2', el: 'H' },
      { id: 'Br2', el: 'Br' },
    ],
    broken: [{ label: 'H\u2013Br', e: 366 }, { label: 'H\u2013Br', e: 366 }],
    formed: [{ label: 'H\u2013H', e: 436 }, { label: 'Br\u2013Br', e: 193 }],
    reactantBonds: [['H1', 'Br1'], ['H2', 'Br2']],
    productBonds: [['H1', 'H2'], ['Br1', 'Br2']],
    layout: [
      { H1: [-2.3, 0.55, 0], Br1: [-1.5, 0.55, 0], H2: [1.5, -0.55, 0], Br2: [2.3, -0.55, 0] },
      { H1: [-2.7, 1.15, 0], Br1: [-1.1, 1.15, 0], H2: [1.1, -1.15, 0], Br2: [2.7, -1.15, 0] },
      { H1: [-1.7, 0.15, 0], H2: [-0.9, 0.15, 0], Br1: [0.95, 0.15, 0], Br2: [1.75, 0.15, 0] },
    ],
  },
};

const sum = (arr) => arr.reduce((s, b) => s + b.e, 0);
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A grey cylinder bond between two world points, fading with `opacity`. */
function Bond({ start, end, opacity }) {
  const data = useMemo(() => {
    const s = new Vector3(...start);
    const e = new Vector3(...end);
    const dir = new Vector3().subVectors(e, s);
    const len = dir.length() || 1;
    const q = new Quaternion().setFromUnitVectors(GEO_UP, dir.clone().normalize());
    return { position: new Vector3().addVectors(s, e).multiplyScalar(0.5).toArray(), quaternion: [q.x, q.y, q.z, q.w], length: len };
  }, [start, end]);
  if (opacity <= 0.03) return null;
  return (
    <mesh position={data.position} quaternion={data.quaternion}>
      <cylinderGeometry args={[0.1, 0.1, data.length, 16]} />
      <meshStandardMaterial color="#c2c9d6" roughness={0.5} metalness={0.1} transparent opacity={opacity} />
    </mesh>
  );
}

/** Atoms + bonds interpolated by a continuous `stage` value (0..2). */
function ReactionScene({ reaction, stage }) {
  const r = REACTIONS[reaction];
  const floorP = Math.max(0, Math.min(1, Math.floor(stage)));
  const f = Math.max(0, Math.min(1, stage - floorP));
  const pos = {};
  r.atoms.forEach((a) => {
    pos[a.id] = lerp3(r.layout[floorP][a.id], r.layout[floorP + 1]?.[a.id] || r.layout[floorP][a.id], f);
  });

  const reactantOpacity = Math.max(0, Math.min(1, 1 - stage));
  const productOpacity = Math.max(0, Math.min(1, stage - 1));

  return (
    <group>
      {r.reactantBonds.map(([a, b], i) => (
        <Bond key={`rb${i}`} start={pos[a]} end={pos[b]} opacity={reactantOpacity} />
      ))}
      {r.productBonds.map(([a, b], i) => (
        <Bond key={`pb${i}`} start={pos[a]} end={pos[b]} opacity={productOpacity} />
      ))}
      {r.atoms.map((a) => (
        <mesh key={a.id} position={pos[a.id]}>
          <sphereGeometry args={[ELEM[a.el].r, 28, 28]} />
          <meshStandardMaterial color={ELEM[a.el].c} roughness={0.35} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

const STAGE_TEXT = [
  'Reactants, with their bonds intact. Nothing has happened yet.',
  'Every reactant bond is broken - that costs energy, so energy is absorbed.',
  'New product bonds snap together - that releases energy.',
];

export default function BondEnergyScene({ onReady, savedState, onSaveState }) {
  const reduce = usePrefersReducedMotion();
  const [reaction, setReaction] = useState(savedState?.reaction ?? 'exo');
  const [phase, setPhase] = useState(savedState?.phase ?? 0); // 0 reactants, 1 broken, 2 products
  const [stage, setStage] = useState(savedState?.phase ?? 0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snap instantly under reduced motion; otherwise glide stage toward phase.
  useEffect(() => {
    if (reduce) setStage(phase);
  }, [phase, reduce]);
  useRaf((dt) => {
    setStage((sv) => {
      if (sv === phase) return sv;
      const step = Math.min(Math.abs(phase - sv), dt * 0.003);
      return sv + Math.sign(phase - sv) * step;
    });
  }, !reduce);

  const r = REACTIONS[reaction];
  const absorbed = sum(r.broken);
  const released = sum(r.formed);
  const net = released - absorbed; // >0 exothermic, <0 endothermic
  const exo = net > 0;

  const showAbsorbed = stage > 0.6;
  const showReleased = stage > 1.6;

  function advance() {
    setPhase((p) => {
      const next = (p + 1) % 3;
      onSaveState?.({ reaction, phase: next });
      return next;
    });
  }
  function chooseReaction(next) {
    setReaction(next);
    setPhase(0);
    setStage(0);
    onSaveState?.({ reaction: next, phase: 0 });
  }

  const btnLabel = phase === 0 ? 'Break the bonds \u2192' : phase === 1 ? 'Form new bonds \u2192' : 'Reset';

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Follow the energy:</strong> breaking bonds <em>absorbs</em> energy and forming bonds
        <em> releases</em> it. Step through {r.name} and watch the ledger decide the net.
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Choose a reaction">
        <button type="button" className={exo ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseReaction('exo')}>
          H&#8322; + Cl&#8322;
        </button>
        <button type="button" className={!exo ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseReaction('endo')}>
          2 HBr
        </button>
      </div>

      <Viewport3D
        height={250}
        autoRotate={false}
        camera={{ position: [0, 0.4, 8], fov: 45 }}
        label={`3D model of ${r.name}. Stage: ${STAGE_TEXT[phase]} Net energy ${exo ? `${net} units released (exothermic)` : `${-net} units absorbed (endothermic)`}.`}
      >
        <ReactionScene reaction={reaction} stage={stage} />
      </Viewport3D>

      <p className={v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', margin: 0 }}>{STAGE_TEXT[phase]}</p>

      {/* energy ledger */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', opacity: showAbsorbed ? 1 : 0.32, transition: 'opacity 0.3s' }}>
          <span>Bonds broken ({r.broken.map((b) => b.label).join(' + ')})</span>
          <strong style={{ color: 'var(--accent-orange)' }}>+{absorbed} in</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', opacity: showReleased ? 1 : 0.32, transition: 'opacity 0.3s' }}>
          <span>Bonds formed ({r.formed.map((b) => b.label).join(' + ')})</span>
          <strong style={{ color: 'var(--accent-green)' }}>&minus;{released} out</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-elevated)', fontWeight: 800, opacity: showReleased ? 1 : 0.32, transition: 'opacity 0.3s' }}>
          <span>Net energy</span>
          <span style={{ color: exo ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
            {exo ? `\u2212${net} (released)` : `+${-net} (absorbed)`}
          </span>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={advance}>{btnLabel}</button>
      </div>

      <p className={showReleased ? (exo ? v.feedbackOk : v.feedbackBad) : v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        {showReleased
          ? exo
            ? `More energy came out (${released}) than went in (${absorbed}), so the reaction releases ${net} units overall - it is exothermic.`
            : `More energy went in (${absorbed}) than came out (${released}), so the reaction absorbs ${-net} units overall - it is endothermic.`
          : 'Break the bonds first (energy in), then form the new ones (energy out), and compare the totals.'}
      </p>
    </div>
  );
}
