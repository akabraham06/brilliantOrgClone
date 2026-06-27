import { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { buildLearnerProfile } from './learnerProfile.js';
import { useLearnerMemory } from './useLearnerMemory.js';

/**
 * Derives the in-context learner profile from live progress + content, ENRICHED
 * with the persistent cross-session learner memory. Must be called within the
 * Progress/Content providers (i.e. the authenticated shell).
 *
 * Because memory is folded in here (and rendered by formatProfileForPrompt), every
 * existing consumer of this hook — tutor, adaptive feedback, review, recap — gains
 * long-term memory automatically, with no change to their call sites.
 */
export function useLearnerProfile() {
  const { progress } = useProgress();
  const { lessons } = useContent();
  const { memory } = useLearnerMemory();
  return useMemo(
    () => buildLearnerProfile(progress, lessons, memory),
    [progress, lessons, memory],
  );
}
