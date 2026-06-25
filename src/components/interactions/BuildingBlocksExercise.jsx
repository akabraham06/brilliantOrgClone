import { useEffect, useMemo, useState } from 'react';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import b from './BuildingBlocksExercise.module.css';

// Fallback config so the component is robust if a slide forgets interactionConfig.
const DEFAULT_CONFIG = {
  atoms: [
    { sym: 'H', name: 'Hydrogen', color: '#e9edf7' },
    { sym: 'O', name: 'Oxygen', color: '#f472b6' },
    { sym: 'C', name: 'Carbon', color: '#94a3b8' },
  ],
  builds: [
    { id: 'water', name: 'Water', formula: 'H2O', need: { H: 2, O: 1 } },
    { id: 'co2', name: 'Carbon dioxide', formula: 'CO2', need: { C: 1, O: 2 } },
    { id: 'methane', name: 'Methane', formula: 'CH4', need: { C: 1, H: 4 } },
  ],
};

/** Pick readable text color (dark/light) for a hex ball color. */
function textOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return '#0e0f13';
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const bl = n & 255;
  // Perceived luminance.
  const lum = (0.299 * r + 0.587 * g + 0.114 * bl) / 255;
  return lum > 0.6 ? '#0e0f13' : '#f6f7fb';
}

/** A colored atom ball with its element symbol. */
function AtomBall({ atom, size = 40 }) {
  return (
    <span
      className={b.ball}
      style={{ width: size, height: size, background: atom.color, color: textOn(atom.color) }}
      aria-hidden="true"
    >
      <span className={b.ballSheen} />
      <span className={b.ballSym}>{atom.sym}</span>
    </span>
  );
}

/** True when the tray's atom counts exactly equal the target's needs. */
function matches(tray, need) {
  const keys = new Set([...Object.keys(need), ...Object.keys(tray)]);
  for (const k of keys) {
    if ((tray[k] || 0) !== (need[k] || 0)) return false;
  }
  return true;
}

/**
 * "Just a few kinds of building blocks": a tap-based molecule builder. The
 * learner has a tiny palette of atoms and assembles several different molecules
 * from them - mirroring how ~100 kinds of atoms build everything. Tap an atom to
 * drop it into the tray; when the tray exactly matches the target molecule's
 * recipe it locks in as complete and the next target unlocks.
 */
export default function BuildingBlocksExercise({ slide, onReady, savedState, onSaveState }) {
  const config = slide?.interactionConfig?.builds ? slide.interactionConfig : DEFAULT_CONFIG;
  const atoms = config.atoms;
  const builds = config.builds;
  const atomBySym = useMemo(() => {
    const map = {};
    atoms.forEach((a) => { map[a.sym] = a; });
    return map;
  }, [atoms]);

  const [buildIndex, setBuildIndex] = useState(() =>
    Math.min(savedState?.buildIndex ?? 0, builds.length - 1),
  );
  const [completed, setCompleted] = useState(() =>
    Array.isArray(savedState?.completed) && savedState.completed.length === builds.length
      ? savedState.completed
      : builds.map(() => false),
  );
  const [tray, setTray] = useState({});

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const target = builds[buildIndex];
  const done = matches(tray, target.need);
  const allDone = completed.every(Boolean);

  // Lock the build in the moment the tray matches its recipe.
  useEffect(() => {
    if (done && !completed[buildIndex]) {
      const next = completed.map((c, i) => (i === buildIndex ? true : c));
      setCompleted(next);
      onSaveState?.({ buildIndex, completed: next });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, buildIndex]);

  function addAtom(sym) {
    if (done) return;
    setTray((prev) => ({ ...prev, [sym]: (prev[sym] || 0) + 1 }));
  }
  function removeAtom(sym) {
    setTray((prev) => {
      if (!prev[sym]) return prev;
      const next = { ...prev, [sym]: prev[sym] - 1 };
      if (next[sym] <= 0) delete next[sym];
      return next;
    });
  }
  function clearTray() {
    setTray({});
  }
  function nextBuild() {
    const next = Math.min(buildIndex + 1, builds.length - 1);
    setBuildIndex(next);
    setTray({});
    onSaveState?.({ buildIndex: next, completed });
  }
  function startOver() {
    const fresh = builds.map(() => false);
    setCompleted(fresh);
    setBuildIndex(0);
    setTray({});
    onSaveState?.({ buildIndex: 0, completed: fresh });
  }

  const isLast = buildIndex === builds.length - 1;

  // Flat list of atoms currently in the tray (for rendering individual balls).
  const trayList = Object.entries(tray).flatMap(([sym, n]) =>
    Array.from({ length: n }, (_, i) => ({ sym, key: `${sym}-${i}` })),
  );

  if (allDone) {
    return (
      <div className={v.stage} style={{ width: '100%' }}>
        <div className={v.objective}>
          <strong>You built every molecule.</strong>
        </div>
        <div className={b.doneGrid}>
          {builds.map((mol) => (
            <div key={mol.id} className={b.doneCard}>
              <div className={b.doneAtoms}>
                {Object.entries(mol.need).flatMap(([sym, n]) =>
                  Array.from({ length: n }, (_, i) => (
                    <AtomBall key={`${sym}-${i}`} atom={atomBySym[sym] || { sym, color: '#94a3b8' }} size={28} />
                  )),
                )}
              </div>
              <div className={b.doneName}>{mol.name}</div>
              <div className={b.doneFormula}><Formula value={mol.formula} /></div>
            </div>
          ))}
        </div>
        <p className={v.feedbackOk}>
          Same handful of atoms, several completely different molecules - exactly how ~100 kinds of
          atoms build everything around you.
        </p>
        <button type="button" className={v.btn} onClick={startOver}>Build them again</button>
      </div>
    );
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={b.progress} role="status" aria-live="polite">
        <span className={v.statLabel}>Build {buildIndex + 1} of {builds.length}</span>
        <span className={b.pips} aria-hidden="true">
          {builds.map((mol, i) => (
            <span
              key={mol.id}
              className={`${b.pip} ${completed[i] ? b.pipDone : ''} ${i === buildIndex ? b.pipActive : ''}`}
            />
          ))}
        </span>
      </div>

      <div className={`${v.panel} ${b.target}`}>
        <div className={v.sceneTitle}>Target molecule</div>
        <div className={b.targetName}>{target.name}</div>
        <div className={b.targetFormula}><Formula value={target.formula} /></div>
        <div className={b.need} aria-label="Atoms needed">
          {Object.entries(target.need).map(([sym, n]) => {
            const have = tray[sym] || 0;
            const ok = have === n;
            return (
              <span key={sym} className={`${b.needChip} ${ok ? b.needChipOk : ''}`}>
                <AtomBall atom={atomBySym[sym] || { sym, color: '#94a3b8' }} size={26} />
                <span className={b.needCount}>{have}/{n}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className={b.tray} aria-label="Build tray">
        <div className={v.sceneTitle}>Tray</div>
        <div className={b.trayItems}>
          {trayList.length === 0 ? (
            <span className={v.muted}>Tap atoms below to add them here.</span>
          ) : (
            trayList.map((item) => (
              <button
                key={item.key}
                type="button"
                className={b.trayBall}
                onClick={() => removeAtom(item.sym)}
                disabled={done}
                aria-label={`Remove one ${atomBySym[item.sym]?.name || item.sym} atom`}
              >
                <AtomBall atom={atomBySym[item.sym] || { sym: item.sym, color: '#94a3b8' }} size={34} />
              </button>
            ))
          )}
        </div>
        {trayList.length > 0 && !done && (
          <button type="button" className={b.clearBtn} onClick={clearTray}>Clear tray</button>
        )}
      </div>

      <div className={b.palette} role="group" aria-label="Atom palette">
        {atoms.map((atom) => (
          <button
            key={atom.sym}
            type="button"
            className={b.paletteBtn}
            onClick={() => addAtom(atom.sym)}
            disabled={done}
            aria-label={`Add a ${atom.name} atom`}
          >
            <AtomBall atom={atom} size={48} />
            <span className={b.paletteName}>{atom.name}</span>
          </button>
        ))}
      </div>

      {done ? (
        <div className={v.feedbackOk}>
          <p style={{ fontWeight: 700 }}>
            {'\u2713'} Built {target.name} (<Formula value={target.formula} />)!
          </p>
          <p>The tray matches the recipe exactly.</p>
          {!isLast && (
            <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={nextBuild} style={{ marginTop: 8 }}>
              Next molecule
            </button>
          )}
        </div>
      ) : (
        <p className={v.muted} style={{ textAlign: 'center' }}>
          Add atoms until the tray exactly matches <strong>{target.name}</strong>. Same few atom types
          build endlessly different molecules.
        </p>
      )}
    </div>
  );
}
