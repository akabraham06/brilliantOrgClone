import { useEffect, useState } from 'react';
import { getElement, shellConfig } from './elements.js';
import OrbitalAtom from './lib/OrbitalAtom.jsx';
import v from './viz.module.css';

const CHOICES = [11, 12, 9, 8, 17];

/** Outer-shell electrons for a neutral atom (used to decide add vs. lose). */
function outerCount(electrons) {
  const shells = shellConfig(electrons);
  return shells[shells.length - 1] || 0;
}
function isFull(electrons) {
  if (electrons <= 0) return false;
  const outer = outerCount(electrons);
  return electrons <= 2 ? outer === 2 : outer === 8;
}

/**
 * "Why atoms form ions": take one atom and add or remove electrons until its
 * outer shell is full. The charge meter shows that once electrons no longer
 * match protons, the atom carries a net charge - it has become an ion.
 */
export default function IonFormationScene({ onReady, savedState, onSaveState }) {
  const [protons, setProtons] = useState(savedState?.protons ?? 11);
  const [electrons, setElectrons] = useState(savedState?.electrons ?? savedState?.protons ?? 11);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const element = getElement(protons);
  const charge = protons - electrons;
  const shells = shellConfig(electrons);
  const stable = isFull(electrons);

  function choose(n) {
    setProtons(n);
    setElectrons(n);
    onSaveState?.({ protons: n, electrons: n });
  }
  function change(delta) {
    setElectrons((e) => {
      const next = Math.max(0, Math.min(20, e + delta));
      onSaveState?.({ protons, electrons: next });
      return next;
    });
  }

  // Guidance: which way does this atom "want" to go to reach a full shell?
  const neutralOuter = outerCount(protons);
  const wantsLose = neutralOuter <= 4 && neutralOuter > 0;
  const guide = wantsLose
    ? `${element.name} has ${neutralOuter} outer electron${neutralOuter === 1 ? '' : 's'} - it is easiest to lose them and expose a full inner shell.`
    : `${element.name} has ${neutralOuter} outer electrons - it is easiest to gain ${8 - neutralOuter} to fill its outer shell.`;

  const SUP = { '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074' };
  const mag = Math.abs(charge);
  const ionSymbol = `${element.symbol}${mag > 1 ? SUP[String(mag)] : ''}${charge > 0 ? '\u207A' : charge < 0 ? '\u207B' : ''}`;

  let message;
  if (charge === 0) message = guide;
  else if (stable) {
    const sign = charge > 0 ? `+${charge}` : `${charge}`;
    message = `Full outer shell! With ${electrons} electrons and ${protons} protons, ${element.name} now carries a net charge of ${sign} - it has become the ion ${ionSymbol}. A charged atom is an ion.`;
  } else {
    message = `Net charge ${charge > 0 ? `+${charge}` : charge}, but the outer shell is not full yet - keep going toward a stable, complete shell.`;
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose atom">
        {CHOICES.map((n) => {
          const el = getElement(n);
          return (
            <button
              key={n}
              type="button"
              className={protons === n ? `${v.toggle} ${v.toggleActive}` : v.toggle}
              onClick={() => choose(n)}
            >
              {el.symbol}
            </button>
          );
        })}
      </div>

      <div className={stable && charge !== 0 ? v.glow : undefined} style={{ width: '100%', maxWidth: 270 }}>
        <OrbitalAtom
          protons={protons}
          neutrons={0}
          shells={shells}
          symbol={element.symbol}
          size={250}
          outerHighlight
          glow={stable && charge !== 0}
          ariaLabel={`${element.name} with ${electrons} electrons, charge ${charge}`}
        />
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-orange)' }}>{protons}</div>
          <div className={v.statLabel}>protons (+)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-blue)' }}>{electrons}</div>
          <div className={v.statLabel}>electrons (-)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: charge === 0 ? 'var(--color-text)' : charge > 0 ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
            {charge > 0 ? `+${charge}` : charge}
          </div>
          <div className={v.statLabel}>{charge === 0 ? 'neutral atom' : 'net charge (ion)'}</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={() => change(-1)} disabled={electrons <= 0}>
          Remove electron
        </button>
        <button type="button" className={v.btn} onClick={() => change(1)} disabled={electrons >= 20}>
          Add electron
        </button>
      </div>

      <p className={charge !== 0 && stable ? v.feedbackOk : v.muted}>{message}</p>
    </div>
  );
}
