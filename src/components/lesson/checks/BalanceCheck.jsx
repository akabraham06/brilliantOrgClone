import EquationBalancer from '../../interactions/EquationBalancer.jsx';

/** Graded equation-balancing check, driven by slide.checkConfig. */
export default function BalanceCheck({ slide, onResult, savedState, onSaveState }) {
  const cfg = slide.checkConfig || {};
  return (
    <EquationBalancer
      slide={slide}
      graded
      config={cfg}
      onResult={onResult}
      savedState={savedState}
      onSaveState={onSaveState}
    />
  );
}
