import { Suspense, useEffect, useRef } from 'react';
import { getInteractionComponent } from '../lesson/interactionRegistry.js';
import InteractionFallback from '../lesson/InteractionFallback.jsx';
import {
  PLAYGROUND_ALLOWLIST,
  PLAYGROUND_KEYS,
  isAllowedPlaygroundKey,
} from '../../ai/playgroundAllowlist.js';
import { summarizeInteraction } from '../../ai/interactionSummary.js';
import styles from './StagePanel.module.css';

// Interactives often persist their default state on mount; ignore `onSaveState`
// calls in this window after a (re)mount so we only react to genuine user edits.
const MOUNT_GRACE_MS = 800;
// Wait for the learner to pause, coalescing a burst of rapid changes (e.g. a
// dragged slider) into a single, settled interaction event.
const SETTLE_MS = 1800;

/** Turns a PascalCase component key into a readable title. */
function humanize(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/3 D\b/, '3D');
}

/**
 * The Lab's interactive stage. Renders the allowlisted interactive for the
 * current key inside a Suspense boundary, remounting on swap (keyed by key).
 * A manual picker is always available so the stage is never empty. Per-key
 * play state is kept in-session (a ref map) so swapping back restores it.
 */
export default function StagePanel({ currentKey, onPick, onInteract }) {
  const stateRef = useRef({});
  const safeKey = isAllowedPlaygroundKey(currentKey) ? currentKey : PLAYGROUND_KEYS[0];
  const Interaction = getInteractionComponent(safeKey);
  const description = PLAYGROUND_ALLOWLIST[safeKey];

  // Interaction-watch bookkeeping. `baseline` is the state to diff the next
  // settled change against; `latest` holds the most recent snapshot; `timer`
  // debounces the burst; `mountedKey/mountedAt` drive the post-mount grace.
  const baselineRef = useRef(undefined);
  const latestRef = useRef(undefined);
  const timerRef = useRef(null);
  const mountedKeyRef = useRef(null);
  const mountedAtRef = useRef(0);

  // Reset the watcher when the stage swaps interactives. Mutating refs during
  // render is intentional here: it must happen before the (remounted) child's
  // own mount-time effects fire so we don't misread a stale grace window.
  if (mountedKeyRef.current !== safeKey) {
    mountedKeyRef.current = safeKey;
    mountedAtRef.current = Date.now();
    baselineRef.current = stateRef.current[safeKey];
    latestRef.current = stateRef.current[safeKey];
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const name = humanize(safeKey);

  function handleSaveState(next) {
    // Preserve the existing per-key restore behaviour.
    stateRef.current[safeKey] = next;
    if (!onInteract) return;

    latestRef.current = next;

    // Treat anything emitted during the post-mount grace as part of the
    // baseline, not a user edit.
    if (Date.now() - mountedAtRef.current < MOUNT_GRACE_MS) {
      baselineRef.current = next;
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const summary = summarizeInteraction(baselineRef.current, latestRef.current, { name });
      baselineRef.current = latestRef.current;
      if (summary) onInteract({ key: safeKey, name, summary, at: Date.now() });
    }, SETTLE_MS);
  }

  const slide = { slideId: `lab-stage-${safeKey}`, interactionComponentKey: safeKey, interactionConfig: {} };

  return (
    <section className={styles.panel} aria-label="Interactive stage">
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.eyebrow}>Interactive</span>
          <h2 className={styles.title}>{humanize(safeKey)}</h2>
        </div>
        <label className={styles.pickerLabel}>
          <span className={styles.srOnly}>Choose an interactive</span>
          <select
            className={styles.picker}
            value={safeKey}
            onChange={(e) => onPick?.(e.target.value)}
          >
            {PLAYGROUND_KEYS.map((k) => (
              <option key={k} value={k}>
                {humanize(k)}
              </option>
            ))}
          </select>
        </label>
      </header>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.stage}>
        <Suspense fallback={<InteractionFallback />}>
          <Interaction
            key={safeKey}
            slide={slide}
            onReady={() => {}}
            savedState={stateRef.current[safeKey]}
            onSaveState={handleSaveState}
          />
        </Suspense>
      </div>
    </section>
  );
}
