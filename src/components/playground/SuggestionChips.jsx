import { PLAYGROUND_ALLOWLIST } from '../../ai/playgroundAllowlist.js';
import styles from './SuggestionChips.module.css';

/**
 * Clickable exploration starts. Picking one loads its interactive onto the
 * stage and seeds the guide with its seedPrompt. Validated keys only.
 */
export default function SuggestionChips({ suggestions, onPick, disabled }) {
  if (!suggestions?.length) return null;
  return (
    <div className={styles.chips} role="group" aria-label="Suggested experiments">
      {suggestions.map((s) => (
        <button
          key={`${s.label}-${s.componentKey}`}
          type="button"
          className={styles.chip}
          onClick={() => onPick?.(s)}
          disabled={disabled}
          title={PLAYGROUND_ALLOWLIST[s.componentKey] || s.label}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
