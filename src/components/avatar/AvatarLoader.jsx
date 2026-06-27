import Avatar from './Avatar.jsx';
import { useEquippedCosmetics } from '../../context/EconomyContext.jsx';
import styles from './AvatarLoader.module.css';

/**
 * Friendly, on-brand loading state that reuses the learner's own avatar (wearing
 * their equipped cosmetics) instead of a plain spinner. The avatar gently bobs
 * over a pulsing shadow with a trailing dot indicator.
 *
 * Reads equipped cosmetics via the SAFE accessor, so it also works in the auth
 * gate (which renders before EconomyProvider mounts) — there it falls back to
 * the clean base blob. Always the cheap SVG avatar; never mounts three.js.
 *
 * All motion is CSS and fully stilled under prefers-reduced-motion. A reserved
 * min-height keeps the loader from shifting layout when content swaps in.
 */
export default function AvatarLoader({
  size = 96,
  label = 'Loading',
  variant = 'block',
  className,
}) {
  const equipped = useEquippedCosmetics();
  const rootClass = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return (
    <div className={rootClass} role="status" aria-live="polite">
      <div className={styles.stage} style={{ width: size }}>
        <span className={styles.bob}>
          <Avatar equipped={equipped} size={size} idle crop="bust" />
        </span>
        <span className={styles.shadow} aria-hidden="true" />
      </div>
      <span className={styles.dots} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
