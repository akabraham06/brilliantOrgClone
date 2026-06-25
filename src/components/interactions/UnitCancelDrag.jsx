import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './UnitCancelDrag.module.css';

/**
 * Dimensional-analysis "unit cancelling" tool. The learner picks the
 * conversion factor whose bottom unit cancels what they started with. Built as
 * accessible buttons (tap or keyboard) with check-try-again feedback. When the
 * correct factor is chosen the matching units strike through and the result is
 * revealed; that marks the slide ready.
 *
 * interactionConfig: { prompt, start:{value,unit}, tiles:[{id,num,den,correct,result,why}] }
 */
const DEFAULT = {
  prompt: 'Convert 3 km into meters by cancelling units.',
  start: { value: 3, unit: 'km' },
  tiles: [
    { id: 't1', num: '1000 m', den: '1 km', correct: true, result: '3000 m' },
    { id: 't2', num: '1 km', den: '1000 m', correct: false, why: 'Here km sits on top, so it cannot cancel the km you started with - flip it over.' },
    { id: 't3', num: '100 cm', den: '1 m', correct: false, why: 'This tile has no km in it, so nothing cancels your starting km.' },
  ],
};

export default function UnitCancelDrag({ slide, onReady, savedState, onSaveState }) {
  const cfg = { ...DEFAULT, ...(slide?.interactionConfig || {}) };
  const [chosen, setChosen] = useState(savedState?.chosen ?? null);
  const [wrongId, setWrongId] = useState(null);

  const chosenTile = cfg.tiles.find((t) => t.id === chosen && t.correct);
  const solved = Boolean(chosenTile);

  useEffect(() => {
    if (solved) onReady?.();
  }, [solved, onReady]);

  function pick(tile) {
    if (solved) return;
    if (tile.correct) {
      setChosen(tile.id);
      setWrongId(null);
      onSaveState?.({ chosen: tile.id });
    } else {
      setWrongId(tile.id);
    }
  }

  const wrongTile = cfg.tiles.find((t) => t.id === wrongId);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <p className={v.objective}>{cfg.prompt}</p>

      <div className={s.chain}>
        <span className={`${s.term} ${solved ? s.cancelLeft : ''}`}>
          {cfg.start.value} <span className={s.unit}>{cfg.start.unit}</span>
        </span>
        {solved && (
          <>
            <span className={s.times}>&times;</span>
            <span className={s.fraction}>
              <span className={s.num}>{chosenTile.num}</span>
              <span className={s.bar} />
              <span className={`${s.den} ${s.cancelRight}`}>{chosenTile.den}</span>
            </span>
            <span className={s.times}>=</span>
            <span className={s.result}>{chosenTile.result}</span>
          </>
        )}
      </div>

      {!solved && (
        <>
          <p className={v.muted}>Tap the factor whose bottom unit cancels your {cfg.start.unit}:</p>
          <div className={s.tiles}>
            {cfg.tiles.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${s.tile} ${wrongId === t.id ? s.tileWrong : ''}`}
                onClick={() => pick(t)}
              >
                <span className={s.num}>{t.num}</span>
                <span className={s.bar} />
                <span className={s.den}>{t.den}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <span role="status" aria-live="polite" className={solved ? v.feedbackOk : wrongTile ? v.feedbackBad : 'sr-only'}>
        {solved
          ? `Units cancel: ${cfg.start.unit} divides out, leaving ${chosenTile.result}.`
          : wrongTile
            ? wrongTile.why
            : ''}
      </span>
    </div>
  );
}
