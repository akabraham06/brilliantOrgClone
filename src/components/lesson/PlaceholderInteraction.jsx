import { useEffect } from 'react';
import styles from './PlaceholderInteraction.module.css';

/**
 * Generic stand-in for an interactive slide visual. The real components
 * (AtomDiagram, MatterSortBoard, etc.) are built in Phase 5 and registered in
 * interactionRegistry.js. Content slides are satisfied as soon as they render,
 * so this calls onReady on mount.
 */
export default function PlaceholderInteraction({ slide, onReady }) {
  useEffect(() => {
    onReady?.();
    // Run once on mount; onReady identity is stable from the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.box}>
      <span className={styles.badge}>{slide.type}</span>
      <p className={styles.key}>{slide.interactionComponentKey || 'Interaction'}</p>
      <p className={styles.note}>Interactive visual arrives in the next build.</p>
    </div>
  );
}
