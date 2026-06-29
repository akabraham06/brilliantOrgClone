import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRewardToast } from '../../context/RewardToastContext.jsx';
import { usePrefersReducedMotion } from '../interactions/lib/motion.js';
import CoinIcon from './CoinIcon.jsx';
import styles from './RewardToast.module.css';

const DISMISS_MS = 3200;

/**
 * Portal that renders the reward-framing toast stack. Auto-dismisses each toast,
 * respects prefers-reduced-motion (no slide/fade animation), and renders nothing
 * when the queue is empty. Self-degrades to a no-op outside a RewardToastProvider.
 */
export default function RewardToast() {
  const { toasts, dismiss } = useRewardToast();
  if (typeof document === 'undefined' || toasts.length === 0) return null;
  return createPortal(
    <div className={styles.stack} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }) {
  const reduce = usePrefersReducedMotion();
  useEffect(() => {
    const id = window.setTimeout(onDismiss, DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [onDismiss]);

  return (
    <div className={`${styles.toast} ${reduce ? '' : styles.animate}`} role="status">
      {toast.icon && (
        <span className={styles.icon} aria-hidden="true">
          {toast.icon}
        </span>
      )}
      <div className={styles.body}>
        {toast.behavior && <span className={styles.behavior}>{toast.behavior}</span>}
        <span className={styles.rewards}>
          {toast.amount > 0 && <span className={styles.xp}>+{toast.amount} XP</span>}
          {toast.coins > 0 && (
            <span className={styles.coins}>
              <CoinIcon size={14} /> +{toast.coins}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
