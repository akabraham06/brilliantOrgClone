import { Suspense } from 'react';
import { getInteractionComponent } from '../lesson/interactionRegistry.js';
import { isAllowedIllustration, ILLUSTRATION_ALLOWLIST } from '../../ai/illustrationAllowlist.js';
import InteractionFallback from '../lesson/InteractionFallback.jsx';
import styles from './TutorIllustration.module.css';

/**
 * Renders one allowlisted interactive inline in the chat to illustrate a tutor
 * answer. Components on the allowlist render standalone, so we pass a minimal
 * slide-like prop and a no-op `onReady`. Unknown keys render nothing.
 */
export default function TutorIllustration({ componentKey, caption }) {
  if (!isAllowedIllustration(componentKey)) return null;
  const Interaction = getInteractionComponent(componentKey);
  const slide = {
    slideId: `tutor-illustration-${componentKey}`,
    subtitle: caption || ILLUSTRATION_ALLOWLIST[componentKey],
    interactionComponentKey: componentKey,
    interactionConfig: {},
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.stage}>
        <Suspense fallback={<InteractionFallback />}>
          <Interaction slide={slide} onReady={() => {}} />
        </Suspense>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
