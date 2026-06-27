import { useCallback } from 'react';
import { useTutor } from '../../context/TutorContext.jsx';

/**
 * Drop-in helper for gated interactive checks (build/drag/placement) that verify
 * with a "Check" button. Call the returned `report(passed, { event })` on every
 * graded verify attempt: after a few consecutive failures on the same slide the
 * tutor auto-opens with a single slight hint (see TutorContext.reportStruggle).
 *
 * No-ops entirely when `enabled` is false, so the same component used in an
 * ungraded/practice mode never reports. The slide is resolved from the tutor's
 * live grounding slide (the one the learner is on), falling back to an explicit
 * `slideId` when the component has it.
 *
 * @param {object}  opts
 * @param {boolean} [opts.enabled=true]  Usually the component's `graded` flag.
 * @param {string}  [opts.slideId]       Explicit slide id (else uses grounding).
 * @param {string}  [opts.hintSeed]      Topic-flavored first message for the chat.
 * @param {number}  [opts.threshold]     Failed attempts before the hint fires.
 */
export function useStruggleReporter({ enabled = true, slideId, hintSeed, threshold } = {}) {
  const { reportStruggle, groundingSlide } = useTutor();
  const id = slideId || groundingSlide?.slideId || null;

  return useCallback(
    (passed, { event } = {}) => {
      if (!enabled) return;
      reportStruggle(id, passed, { hintSeed, threshold, event });
    },
    [enabled, id, hintSeed, threshold, reportStruggle],
  );
}
