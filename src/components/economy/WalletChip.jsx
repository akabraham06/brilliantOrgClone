import { Link } from 'react-router-dom';
import { useEconomy } from '../../context/EconomyContext.jsx';
import CoinIcon from './CoinIcon.jsx';
import styles from './WalletChip.module.css';

/**
 * Compact wallet readout: level badge, an XP-to-next-level mini bar, and the coin
 * balance. Links to the Store. Used in the Navbar (compact) and Home (full).
 */
export default function WalletChip({ variant = 'compact' }) {
  const { level, coins, levelInfo } = useEconomy();
  const full = variant === 'full';

  return (
    <Link
      to="/app/store"
      className={`${styles.chip} ${full ? styles.full : ''}`}
      aria-label={`Level ${level}, ${coins} coins. Open the store.`}
      title="Open the Store"
    >
      <span className={styles.level}>
        <span className={styles.levelLabel}>LV</span>
        <span className={styles.levelNum}>{level}</span>
      </span>

      <span className={styles.barWrap}>
        <span
          className={styles.bar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={levelInfo.pct}
        >
          <span className={styles.barFill} style={{ width: `${levelInfo.pct}%` }} />
        </span>
        {full && (
          <span className={styles.barText}>
            {levelInfo.atMax ? 'Max level' : `${levelInfo.into} / ${levelInfo.span} XP`}
          </span>
        )}
      </span>

      <span className={styles.coins}>
        <CoinIcon size={16} />
        <span className={styles.coinNum}>{coins.toLocaleString()}</span>
      </span>
    </Link>
  );
}
