import { useEffect, useState } from 'react';
import v from './viz.module.css';

const AVOGADRO = 6.022e23;

/**
 * Moles <-> particles as a conversion "machine" - a different take on the same
 * idea taught earlier with mole clusters. Pick a direction; the machine shows
 * the input quantity feeding through a x / divide Avogadro's-number step into
 * the output. Reinforces: moles -> particles multiplies by 6.022x10^23, and
 * particles -> moles divides by it.
 */
function Sci({ value }) {
  const [mant, exp] = value.toExponential(3).split('e');
  return (
    <>
      {mant} &times; 10<sup>{Number(exp)}</sup>
    </>
  );
}

export default function MolesParticlesConverter({ onReady, savedState, onSaveState }) {
  const [moles, setMoles] = useState(savedState?.moles ?? 2);
  const [dir, setDir] = useState(savedState?.dir ?? 'm2p'); // 'm2p' | 'p2m'

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const particles = moles * AVOGADRO;
  const m2p = dir === 'm2p';

  function change(value) {
    setMoles(value);
    onSaveState?.({ moles: value, dir });
  }
  function chooseDir(next) {
    setDir(next);
    onSaveState?.({ moles, dir: next });
  }

  const molesBox = (
    <div className={v.stat} style={{ minWidth: 120 }}>
      <div className={v.statValue} style={{ color: 'var(--accent-green)' }}>{moles}</div>
      <div className={v.statLabel}>mole{moles === 1 ? '' : 's'}</div>
    </div>
  );
  const particlesBox = (
    <div className={v.stat} style={{ minWidth: 140 }}>
      <div className={v.statValue} style={{ color: 'var(--accent-blue)', fontSize: 'var(--text-lg)' }}><Sci value={particles} /></div>
      <div className={v.statLabel}>particles</div>
    </div>
  );

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Conversion direction">
        <button type="button" className={m2p ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseDir('m2p')}>
          moles &rarr; particles
        </button>
        <button type="button" className={!m2p ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseDir('p2m')}>
          particles &rarr; moles
        </button>
      </div>

      {/* the conversion machine: input -> operation -> output */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', width: '100%' }}>
        {m2p ? molesBox : particlesBox}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontWeight: 800, color: 'var(--accent-orange)', whiteSpace: 'nowrap' }}>
            {m2p ? '\u00D7' : '\u00F7'} 6.022&times;10&sup2;&sup3;
          </span>
          <span aria-hidden="true" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-text-subtle)', lineHeight: 1 }}>&rarr;</span>
          <span className={v.statLabel}>Avogadro&rsquo;s number</span>
        </div>
        {m2p ? particlesBox : molesBox}
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 360, alignItems: 'center' }}>
        <span className={v.statLabel}>
          Adjust the {m2p ? 'moles' : 'number of particles'}: <strong>{m2p ? `${moles} mol` : <Sci value={particles} />}</strong>
        </span>
        <input
          className={v.slider}
          type="range"
          min={0.5}
          max={6}
          step={0.5}
          value={moles}
          onChange={(e) => change(Number(e.target.value))}
          aria-label={m2p ? 'Number of moles' : 'Number of particles, in moles'}
        />
      </label>

      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 440 }}>
        {m2p
          ? <>To go from <strong>moles to particles</strong>, multiply by Avogadro&rsquo;s number: {moles} mol &times; 6.022&times;10&sup2;&sup3; = <Sci value={particles} /> particles.</>
          : <>To go from <strong>particles to moles</strong>, divide by Avogadro&rsquo;s number: <Sci value={particles} /> &div; 6.022&times;10&sup2;&sup3; = {moles} mol.</>}
      </p>
    </div>
  );
}
