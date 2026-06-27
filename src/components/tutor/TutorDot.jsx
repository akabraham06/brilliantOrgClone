import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiEnabled } from '../../firebase/ai.js';
import { useTutor } from '../../context/TutorContext.jsx';
import { usePrefersReducedMotion } from '../interactions/lib/motion.js';
import TutorPanel from './TutorPanel.jsx';
import styles from './TutorDot.module.css';

/**
 * Bottom-left animated tutor launcher. Renders nothing when AI is disabled, so
 * unconfigured deployments are visually unchanged. The orb morphs into the chat
 * panel on open. Idle/active animations respect prefers-reduced-motion.
 */
export default function TutorDot() {
  const { open, openTutor, closeTutor, helpOffer, acceptHelpOffer, dismissHelpOffer } = useTutor();
  const reduce = usePrefersReducedMotion();

  if (!aiEnabled) return null;

  const spring = reduce
    ? { duration: 0 }
    : { type: 'spring', stiffness: 260, damping: 24 };
  const offering = Boolean(helpOffer) && !open;

  return createPortal(
    <div className={styles.root}>
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="panel"
            className={styles.panelWrap}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 24 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 24 }}
            transition={spring}
          >
            <TutorPanel onClose={closeTutor} reduce={reduce} />
          </motion.div>
        ) : (
          <motion.div
            key="launcher"
            className={styles.launcher}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            transition={spring}
          >
            <AnimatePresence>
              {offering && (
                <motion.div
                  key="nudge"
                  className={styles.nudge}
                  role="status"
                  aria-live="polite"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.92 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.92 }}
                  transition={spring}
                >
                  <p className={styles.nudgeText}>Stuck on this one? Want a hand?</p>
                  <div className={styles.nudgeActions}>
                    <button type="button" className={styles.nudgeYes} onClick={acceptHelpOffer}>
                      Yes, help me
                    </button>
                    <button
                      type="button"
                      className={styles.nudgeDismiss}
                      onClick={dismissHelpOffer}
                    >
                      Not now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              className={`${styles.orb} ${offering ? styles.orbAttention : ''}`}
              onClick={() => openTutor()}
              aria-label={offering ? 'Open chemistry tutor for help with this question' : 'Open chemistry tutor'}
              aria-haspopup="dialog"
              whileHover={reduce ? undefined : { scale: 1.08 }}
              whileTap={reduce ? undefined : { scale: 0.94 }}
            >
              <span className={`${styles.core} ${reduce ? '' : styles.coreAlive}`} aria-hidden="true" />
              {!reduce && (
                <>
                  <span className={`${styles.orbit} ${styles.orbit1}`} aria-hidden="true">
                    <span className={styles.particle} style={{ background: 'var(--accent-green)' }} />
                  </span>
                  <span className={`${styles.orbit} ${styles.orbit2}`} aria-hidden="true">
                    <span className={styles.particle} style={{ background: 'var(--accent-purple)' }} />
                  </span>
                  <span className={`${styles.orbit} ${styles.orbit3}`} aria-hidden="true">
                    <span className={styles.particle} style={{ background: 'var(--accent-blue)' }} />
                  </span>
                </>
              )}
              <span className="sr-only">Ask the chemistry tutor</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
