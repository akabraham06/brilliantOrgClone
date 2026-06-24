import { useEffect, useState } from 'react';
import { getElement, shellConfig } from './elements.js';
import OrbitalAtom from './lib/OrbitalAtom.jsx';
import DragChip from './DragChip.jsx';
import v from './viz.module.css';

const PROTON = 'var(--accent-orange)';
const NEUTRON = '#8b93a7';
const ELECTRON = 'var(--accent-blue)';

const PART_INFO = {
  proton: { label: 'Proton', text: 'Charge +1, sits in the nucleus. The proton count is the atomic number and decides which element it is.', color: PROTON },
  neutron: { label: 'Neutron', text: 'No charge, sits in the nucleus. Changing neutrons makes a different isotope - but the same element.', color: NEUTRON },
  electron: { label: 'Electron', text: 'Charge -1, orbits the nucleus in shells. Gaining or losing electrons makes an ion.', color: ELECTRON },
  nucleus: { label: 'Nucleus', text: 'The dense center holding protons and neutrons. Almost all the mass lives here.', color: PROTON },
};

/** A particle "shape" matching the spheres in the atom diagram above. */
function ParticleShape({ color, idKey }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`ps-${idKey}`} cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="34%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle cx="10" cy="10" r="9" fill={color} stroke="rgba(0,0,0,0.3)" />
      <circle cx="10" cy="10" r="9" fill={`url(#ps-${idKey})`} />
    </svg>
  );
}

function chipLabel(idKey, color, name) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <ParticleShape idKey={idKey} color={color} />
      {name}
    </span>
  );
}

/**
 * Build-an-Atom: add protons, neutrons, and electrons (drag the particle tokens
 * onto the atom or use the steppers) and watch the element, mass number,
 * isotope, charge, and stability update on a rotatable pseudo-3D atom.
 *
 * With `interactionConfig.challenge` the slide becomes a small objective: build
 * a target atom, press Check, and get try-again feedback (this also gates Next).
 */
export default function AtomDiagram({ slide, onReady, savedState, onSaveState }) {
  const cfg = slide?.interactionConfig || {};
  const challenge = cfg.challenge || null;

  const [protons, setProtons] = useState(savedState?.protons ?? cfg.protons ?? 6);
  const [neutrons, setNeutrons] = useState(savedState?.neutrons ?? cfg.neutrons ?? 6);
  const [electrons, setElectrons] = useState(savedState?.electrons ?? cfg.electrons ?? cfg.protons ?? 6);
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(savedState?.passed ? 'pass' : null);

  useEffect(() => {
    if (!challenge) onReady?.();
    else if (savedState?.passed) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const element = getElement(protons);
  const massNumber = protons + neutrons;
  const charge = protons - electrons;
  const shells = shellConfig(electrons);
  const outer = shells[shells.length - 1] || 0;
  const stable = electrons > 0 && (electrons <= 2 ? outer === 2 : outer === 8);

  const ionLabel = charge === 0 ? 'Neutral atom' : charge > 0 ? `Cation (+${charge})` : `Anion (${charge})`;
  const isotope = element ? `${element.symbol}-${massNumber}` : '-';

  const fieldValue = (f) => ({ protons, neutrons, electrons, mass: massNumber, charge, symbol: element?.symbol }[f]);

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  function persist(p, n, e, passed) {
    onSaveState?.({ protons: p, neutrons: n, electrons: e, passed });
  }
  const setP = (val) => { const x = clamp(val, 1, 20); setProtons(x); setChecked(null); persist(x, neutrons, electrons, savedState?.passed); };
  const setN = (val) => { const x = clamp(val, 0, 24); setNeutrons(x); setChecked(null); persist(protons, x, electrons, savedState?.passed); };
  const setE = (val) => { const x = clamp(val, 0, 20); setElectrons(x); setChecked(null); persist(protons, neutrons, x, savedState?.passed); };
  const add = { proton: () => setP(protons + 1), neutron: () => setN(neutrons + 1), electron: () => setE(electrons + 1) };

  function checkObjective() {
    const ok = (challenge.conditions || []).every((c) => fieldValue(c.field) === c.value);
    setChecked(ok ? 'pass' : 'fail');
    if (ok) {
      onReady?.();
      persist(protons, neutrons, electrons, true);
    }
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      {challenge && (
        <div className={v.objective}>
          <strong>Goal: </strong>{challenge.prompt}
        </div>
      )}

      <div data-dropzone="atom" style={{ width: '100%', maxWidth: 300 }}>
        <OrbitalAtom
          protons={protons}
          neutrons={neutrons}
          shells={shells}
          symbol={element?.symbol}
          size={260}
          outerHighlight
          glow={stable}
          ariaLabel={`${element?.name || 'unknown'} atom, charge ${charge}`}
        />
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-green)' }}>{element?.symbol || '?'}</div>
          <div className={v.statLabel}>{element?.name || 'No element'}</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{isotope}</div>
          <div className={v.statLabel}>isotope (mass {massNumber})</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: charge === 0 ? 'var(--color-text)' : charge > 0 ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
            {charge > 0 ? `+${charge}` : charge}
          </div>
          <div className={v.statLabel}>{ionLabel}</div>
        </div>
      </div>

      {/* Drag a particle (matching the shapes above) onto the atom, or tap. */}
      <div className={v.row}>
        <DragChip id="proton" label={chipLabel('proton', PROTON, 'Proton')} className={v.chip} onTap={add.proton} onDrop={(id, zone) => zone === 'atom' && add.proton()} />
        <DragChip id="neutron" label={chipLabel('neutron', NEUTRON, 'Neutron')} className={v.chip} onTap={add.neutron} onDrop={(id, zone) => zone === 'atom' && add.neutron()} />
        <DragChip id="electron" label={chipLabel('electron', ELECTRON, 'Electron')} className={v.chip} onTap={add.electron} onDrop={(id, zone) => zone === 'atom' && add.electron()} />
      </div>

      <div className={v.row}>
        <Stepper label="Protons" value={protons} min={1} max={20} onChange={setP} />
        <Stepper label="Neutrons" value={neutrons} min={0} max={24} onChange={setN} />
        <Stepper label="Electrons" value={electrons} min={0} max={20} onChange={setE} />
      </div>

      {challenge ? (
        checked === 'pass' ? (
          <div className={v.feedbackOk}>{challenge.success || 'Correct - objective complete!'}</div>
        ) : (
          <>
            {checked === 'fail' && (
              <div className={v.feedbackBad}>
                Not yet - keep adjusting the counts to match the goal.
              </div>
            )}
            <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={checkObjective}>
              Check
            </button>
          </>
        )
      ) : (
        <>
          <div className={v.row} role="group" aria-label="Atom parts">
            {Object.keys(PART_INFO).map((k) => (
              <button key={k} type="button" className={picked === k ? `${v.chip} ${v.chipSelected}` : v.chip} onClick={() => setPicked(k)}>
                {PART_INFO[k].label}
              </button>
            ))}
          </div>
          {picked ? (
            <p className={v.muted}>
              <strong style={{ color: PART_INFO[picked].color }}>{PART_INFO[picked].label}:</strong> {PART_INFO[picked].text}
            </p>
          ) : (
            <p className={v.muted}>Drag a particle onto the atom, or tap a part to learn its role. Drag the atom to rotate it.</p>
          )}
        </>
      )}
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className={v.statLabel} style={{ marginBottom: 6 }}>{label}</div>
      <div className={v.stepper}>
        <button type="button" className={v.stepBtn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Remove ${label}`}>
          &minus;
        </button>
        <span className={v.stepValue}>{value}</span>
        <button type="button" className={v.stepBtn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Add ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
