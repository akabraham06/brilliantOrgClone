import { useEffect, useState } from 'react';
import v from './viz.module.css';

/**
 * Reactants and products: tap either side of the arrow to highlight it and
 * learn which substances start the reaction vs. which are produced.
 */
export default function ReactionLayout({ slide, onReady }) {
  const reactants = slide?.interactionConfig?.reactants || ['CH4', '2 O2'];
  const products = slide?.interactionConfig?.products || ['CO2', '2 H2O'];
  const [side, setSide] = useState(null);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Side({ id, terms, color }) {
    const active = side === id;
    return (
      <button
        type="button"
        onClick={() => setSide(id)}
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          border: `2px solid ${active ? color : 'var(--color-border-strong)'}`,
          background: active ? 'var(--color-surface-hover)' : 'var(--color-bg-elevated)',
          fontWeight: 700,
          fontSize: 'var(--text-lg)',
        }}
      >
        {terms.join(' + ')}
      </button>
    );
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.row}>
        <Side id="reactants" terms={reactants} color="var(--accent-blue)" />
        <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>&rarr;</span>
        <Side id="products" terms={products} color="var(--accent-green)" />
      </div>
      <p className={v.muted}>
        {side === 'reactants' && 'Reactants: the starting substances, written on the left.'}
        {side === 'products' && 'Products: the new substances formed, written on the right.'}
        {side == null && 'Tap each side of the arrow to see what it represents.'}
      </p>
    </div>
  );
}
