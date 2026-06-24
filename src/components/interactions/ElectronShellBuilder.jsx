import { useEffect, useState } from 'react';
import { getElement, shellConfig, valenceElectrons } from './elements.js';
import OrbitalAtom from './lib/OrbitalAtom.jsx';
import DragChip from './DragChip.jsx';
import v from './viz.module.css';

const DEFAULT_CHOICES = [1, 2, 6, 8, 11, 12, 17];
const SHELL_CAP = [2, 8, 8, 2];

/**
 * Build an atom's electron arrangement by adding electrons one at a time. Inner
 * shells fill first; a live shell map shows which shell is currently filling and
 * how full each is, so the "shells fill in order" process is explicit.
 *
 * With `interactionConfig.challenge = { type: 'valence' }` the slide turns into a
 * valence check: once the atom is built, identify how many valence electrons it
 * has (check / try-again, which also gates Next).
 */
export default function ElectronShellBuilder({ slide, onReady, savedState, onSaveState }) {
  const cfg = slide?.interactionConfig || {};
  const choices = cfg.elements || DEFAULT_CHOICES;
  const challenge = cfg.challenge || null;

  const [atomicNumber, setAtomicNumber] = useState(savedState?.atomicNumber ?? cfg.element ?? 8);
  const [placed, setPlaced] = useState(savedState?.placed ?? 0);
  const [guess, setGuess] = useState(null);
  const [checked, setChecked] = useState(savedState?.passed ? 'pass' : null);

  useEffect(() => {
    if (!challenge) onReady?.();
    else if (savedState?.passed) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const element = getElement(atomicNumber);
  const complete = placed >= atomicNumber;
  const placedShells = placed > 0 ? shellConfig(Math.min(placed, atomicNumber)) : [];
  const fullShells = shellConfig(atomicNumber);
  const fillingIndex = Math.max(0, placedShells.length - 1);
  const valence = valenceElectrons(element);

  function selectElement(n) {
    setAtomicNumber(n);
    setPlaced(0);
    setGuess(null);
    setChecked(null);
    onSaveState?.({ atomicNumber: n, placed: 0, passed: false });
  }
  function addElectron() {
    setPlaced((p) => {
      const next = Math.min(atomicNumber, p + 1);
      onSaveState?.({ atomicNumber, placed: next, passed: savedState?.passed });
      return next;
    });
  }

  function checkValence() {
    const ok = guess === valence;
    setChecked(ok ? 'pass' : 'fail');
    if (ok) {
      onReady?.();
      onSaveState?.({ atomicNumber, placed, passed: true });
    }
  }

  const valenceOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      {challenge && (
        <div className={v.objective}>
          <strong>Goal: </strong>Build {element.name}, then say how many electrons are in its outermost shell.
        </div>
      )}

      <div className={v.toggleGroup} role="group" aria-label="Choose element">
        {choices.map((n) => {
          const el = getElement(n);
          return (
            <button
              key={n}
              type="button"
              className={atomicNumber === n ? `${v.toggle} ${v.toggleActive}` : v.toggle}
              onClick={() => selectElement(n)}
            >
              {el.symbol}
            </button>
          );
        })}
      </div>

      <div data-dropzone="shell" className={complete ? v.glow : undefined} style={{ width: '100%', maxWidth: 280 }}>
        <OrbitalAtom
          protons={atomicNumber}
          neutrons={0}
          shells={placedShells}
          symbol={element.symbol}
          size={250}
          outerHighlight={complete}
          ariaLabel={`${element.name}: ${placed} of ${atomicNumber} electrons placed`}
        />
      </div>

      {/* Shell-by-shell progress: makes the "fill in order" process explicit. */}
      <div className={v.row} aria-label="Shell fill progress">
        {fullShells.map((cap, i) => {
          const here = placedShells[i] || 0;
          const isFilling = !complete && i === fillingIndex && here > 0;
          const done = here >= SHELL_CAP[i];
          let cls = v.shellPill;
          if (isFilling) cls += ` ${v.shellPillActive}`;
          else if (done) cls += ` ${v.shellPillDone}`;
          return (
            <div key={i} className={cls}>
              <span className={v.shellPillName}>Shell {i + 1}</span>
              <span className={v.shellPillCount}>{here}/{SHELL_CAP[i]}</span>
            </div>
          );
        })}
      </div>

      <div className={v.row}>
        <DragChip
          id="electron"
          label="+ Electron"
          className={v.chip}
          disabled={complete}
          onTap={addElectron}
          onDrop={(id, zone) => zone === 'shell' && addElectron()}
        />
        {placed > 0 && !complete && (
          <button type="button" className={v.btn} onClick={() => selectElement(atomicNumber)}>
            Reset
          </button>
        )}
      </div>

      {!complete && (
        <p className={v.muted}>
          Add electrons one at a time - the inner shell fills to {SHELL_CAP[0]} first, then the next to {SHELL_CAP[1]}.
          {' '}{Math.max(0, atomicNumber - placed)} more to finish {element.name}.
        </p>
      )}

      {complete && challenge?.type === 'valence' && (
        checked === 'pass' ? (
          <div className={v.feedbackOk}>
            Correct - {element.name} has {valence} valence electron{valence === 1 ? '' : 's'} (the electrons in its outer shell).
          </div>
        ) : (
          <>
            <p className={v.muted}>How many electrons are in the highlighted outer shell?</p>
            <div className={v.row}>
              {valenceOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={guess === n ? `${v.chip} ${v.chipSelected}` : v.chip}
                  onClick={() => { setGuess(n); setChecked(null); }}
                >
                  {n}
                </button>
              ))}
            </div>
            {checked === 'fail' && (
              <div className={v.feedbackBad}>Not quite - count only the electrons in the outermost (yellow) shell. Try again.</div>
            )}
            <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={checkValence} disabled={guess == null}>
              Check
            </button>
          </>
        )
      )}

      {complete && !challenge && <BondingTendency element={element} />}
    </div>
  );
}

function BondingTendency({ element }) {
  const valence = valenceElectrons(element);
  const outerCapacity = element.number <= 2 ? 2 : 8;
  let msg;
  if (valence === outerCapacity) {
    msg = `${element.name} already has a full outer shell, so it is stable and rarely bonds.`;
  } else if (valence <= outerCapacity / 2) {
    msg = `${element.name} has ${valence} valence electron${valence === 1 ? '' : 's'} - it tends to lose ${valence} to empty its outer shell, forming a +${valence} ion.`;
  } else {
    const need = outerCapacity - valence;
    msg = `${element.name} has ${valence} valence electrons - it wants ${need} more to fill its outer shell, forming a ${-need} ion.`;
  }
  return <p className={v.feedbackOk}>{msg}</p>;
}
