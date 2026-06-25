import { useEffect, useState } from 'react';
import Formula from './Formula.jsx';
import v from './viz.module.css';

const CATIONS = [
  { symbol: 'Na', charge: 1 },
  { symbol: 'Mg', charge: 2 },
  { symbol: 'Al', charge: 3 },
];
const ANIONS = [
  { symbol: 'Cl', charge: -1 },
  { symbol: 'O', charge: -2 },
];

/**
 * Build a neutral ionic compound: adjust how many of each ion until the total
 * charge balances to zero, then read off the formula (e.g. Mg2+ + Cl- -> MgCl2).
 * Objective-gated: the learner must reach a neutral compound and press Check.
 */
export default function IonicFormulaBuilder({ onReady, savedState, onSaveState }) {
  const [catIdx, setCatIdx] = useState(savedState?.catIdx ?? 1);
  const [anIdx, setAnIdx] = useState(savedState?.anIdx ?? 0);
  const [nCat, setNCat] = useState(savedState?.nCat ?? 1);
  const [nAn, setNAn] = useState(savedState?.nAn ?? 1);
  const [submitted, setSubmitted] = useState(savedState?.submitted ?? false);

  const cation = CATIONS[catIdx];
  const anion = ANIONS[anIdx];
  const net = nCat * cation.charge + nAn * anion.charge;
  const neutral = net === 0;
  const formula = `${cation.symbol}${nCat > 1 ? nCat : ''}${anion.symbol}${nAn > 1 ? nAn : ''}`;

  // Re-satisfy on remount if a neutral compound was already checked.
  useEffect(() => {
    if (savedState?.submitted && neutral) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save(next) {
    onSaveState?.({ catIdx, anIdx, nCat, nAn, submitted: false, ...next });
  }
  function pickCat(i) {
    setCatIdx(i); setNCat(1); setNAn(1); setSubmitted(false);
    save({ catIdx: i, nCat: 1, nAn: 1 });
  }
  function pickAn(i) {
    setAnIdx(i); setNCat(1); setNAn(1); setSubmitted(false);
    save({ anIdx: i, nCat: 1, nAn: 1 });
  }
  function changeCat(val) { setNCat(val); setSubmitted(false); save({ nCat: val }); }
  function changeAn(val) { setNAn(val); setSubmitted(false); save({ nAn: val }); }

  function check() {
    setSubmitted(true);
    onSaveState?.({ catIdx, anIdx, nCat, nAn, submitted: true });
    if (neutral) onReady?.();
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> pick a metal and nonmetal, then adjust the counts until the net charge is <strong>0</strong>. Read off the neutral formula and press Check.
      </div>

      <div className={v.row}>
        <div className={v.toggleGroup} role="group" aria-label="Choose cation">
          {CATIONS.map((c, i) => (
            <button key={c.symbol} type="button" className={catIdx === i ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => pickCat(i)}>
              <Formula value={`${c.symbol}${c.charge}+`} />
            </button>
          ))}
        </div>
        <div className={v.toggleGroup} role="group" aria-label="Choose anion">
          {ANIONS.map((a, i) => (
            <button key={a.symbol} type="button" className={anIdx === i ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => pickAn(i)}>
              <Formula value={`${a.symbol}${a.charge}`} />
            </button>
          ))}
        </div>
      </div>

      <div className={v.row}>
        <Counter label={<Formula value={`${cation.symbol}${cation.charge}+`} />} value={nCat} onChange={changeCat} />
        <Counter label={<Formula value={`${anion.symbol}${anion.charge}`} />} value={nAn} onChange={changeAn} />
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div
            className={v.statValue}
            style={{ color: submitted ? (neutral ? 'var(--accent-green)' : 'var(--accent-orange)') : 'var(--color-text)' }}
          >
            {net > 0 ? `+${net}` : net}
          </div>
          <div className={v.statLabel}>net charge</div>
        </div>
        {/* Reveal the confirmed neutral formula only after a correct Check. */}
        {submitted && neutral && (
          <div className={v.stat}>
            <div className={v.statValue} style={{ color: 'var(--accent-green)' }}><Formula value={formula} /></div>
            <div className={v.statLabel}>neutral formula</div>
          </div>
        )}
      </div>

      {submitted ? (
        <div className={neutral ? v.feedbackOk : v.feedbackBad}>
          <p>{neutral ? <>Balanced! <Formula value={formula} /> has no overall charge.</> : 'Not balanced yet - the net charge must be exactly 0.'}</p>
          <button type="button" className={v.btn} onClick={() => setSubmitted(false)} style={{ marginTop: 8 }}>Try again</button>
        </div>
      ) : (
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={check}>
          Check
        </button>
      )}
    </div>
  );
}

function Counter({ label, value, onChange }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className={v.statLabel} style={{ marginBottom: 6 }}>{label}</div>
      <div className={v.stepper}>
        <button type="button" className={v.stepBtn} onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Fewer">&minus;</button>
        <span className={v.stepValue}>{value}</span>
        <button type="button" className={v.stepBtn} onClick={() => onChange(Math.min(4, value + 1))} disabled={value >= 4} aria-label="More">+</button>
      </div>
    </div>
  );
}
