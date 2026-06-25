/* eslint-disable react-refresh/only-export-components */
/*
 * Shared Framer Motion surface for the board / reveal interactives.
 *
 * Why a wrapper module: every framer-motion enhancement must respect the
 * reduced-motion handling won in the critique pass. Wrapping children in
 * <ReducedMotionConfig> sets MotionConfig reducedMotion="user", so framer
 * automatically drops transform/layout animations (keeping opacity) when the
 * user prefers reduced motion - no per-component branching required.
 *
 * Import motion/AnimatePresence/etc. from here (not directly from
 * 'framer-motion') so the reduced-motion policy stays consistent and there is a
 * single dependency seam.
 */
import { MotionConfig } from 'framer-motion';

export { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';

/**
 * Wrap any subtree that uses motion so animations honor the OS reduced-motion
 * setting. `reducedMotion="user"` => respect the media query automatically.
 */
export function ReducedMotionConfig({ children, transition }) {
  return (
    <MotionConfig reducedMotion="user" transition={transition}>
      {children}
    </MotionConfig>
  );
}

/** Spring tuned for chip placement / settling. Calm, no overshoot wobble. */
export const placeSpring = { type: 'spring', stiffness: 360, damping: 30, mass: 0.7 };

/** Standard enter/exit for reveal blocks (PredictRevealCard, grading reveals). */
export const revealVariants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};
