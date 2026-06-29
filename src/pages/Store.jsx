import { useEffect, useMemo, useRef, useState } from 'react';
import { useEconomy } from '../context/EconomyContext.jsx';
import { useRewardToast } from '../context/RewardToastContext.jsx';
import { usePrefersReducedMotion } from '../components/interactions/lib/motion.js';
import {
  CATALOG,
  SLOTS,
  slotLabel,
  RARITY_META,
  getCosmeticById,
} from '../data/cosmetics.js';
import {
  featuredToday,
  featuredPrice,
  getSeason,
  SEASON_META,
  MASTERY_COSMETICS,
} from '../data/storeRotation.js';
import { msUntilReset } from '../data/dailyQuests.js';
import Avatar from '../components/avatar/Avatar.jsx';
import CoinIcon from '../components/economy/CoinIcon.jsx';
import styles from './Store.module.css';

/** "Hh Mm" until local-midnight reset (gentle on re-renders — no live seconds). */
function formatCountdown(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Cosmetics Store: preview your avatar, browse the 50-item catalog by slot, and
 * buy / equip items. Buying and equipping persist to the account-level economy
 * (users/{uid}.economy) via EconomyContext, with level + coin gating enforced
 * there too.
 */
export default function Store() {
  const { economy, coins, level, buy, equip, unequip } = useEconomy();
  const { pushReward } = useRewardToast();
  const [filter, setFilter] = useState('all');
  const [flash, setFlash] = useState(null); // { id, kind } for a brief buy/equip pulse
  const [hoverId, setHoverId] = useState(null); // item being previewed on hover
  const reduceMotion = usePrefersReducedMotion();
  const stageRef = useRef(null);

  const owned = economy.ownedCosmetics;
  const ownedCount = owned.length;

  const items = useMemo(
    () => (filter === 'all' ? CATALOG : CATALOG.filter((c) => c.slot === filter)),
    [filter],
  );

  const featured = useMemo(() => featuredToday(), []);
  const season = useMemo(() => getSeason(), []);
  const seasonMeta = SEASON_META[season];

  // Countdown to the next local-midnight rotation (refresh every 30s, gentle).
  const [countdown, setCountdown] = useState(() => msUntilReset());
  useEffect(() => {
    const id = window.setInterval(() => setCountdown(msUntilReset()), 30000);
    return () => window.clearInterval(id);
  }, []);

  // While hovering an item, preview it on the avatar by overriding its slot.
  const previewEquipped = useMemo(() => {
    if (!hoverId) return economy.equipped;
    const item = getCosmeticById(hoverId);
    if (!item) return economy.equipped;
    return { ...economy.equipped, [item.slot]: item.id };
  }, [hoverId, economy.equipped]);

  // The avatar "jumps" to put on each newly previewed item (Web Animations API so
  // it replays per item without remounting). Disabled under reduced motion.
  useEffect(() => {
    if (!hoverId || reduceMotion) return undefined;
    const el = stageRef.current;
    if (!el || typeof el.animate !== 'function') return undefined;
    const anim = el.animate(
      [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(3px) scale(1.06, 0.92)', offset: 0.16 },
        { transform: 'translateY(-24px) scale(0.95, 1.08)', offset: 0.46 },
        { transform: 'translateY(0) scale(1.05, 0.94)', offset: 0.76 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      { duration: 620, easing: 'ease-out' },
    );
    return () => anim.cancel();
  }, [hoverId, reduceMotion]);

  function handleBuy(item) {
    const res = buy(item.id);
    if (res.ok) {
      setFlash({ id: item.id, kind: 'bought' });
      window.setTimeout(() => setFlash(null), 900);
      // Completing the catalog with this purchase earns a mastery exclusive.
      if (res.masteryGranted) {
        pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
      }
    }
  }

  function toggleEquip(item) {
    if (economy.equipped[item.slot] === item.id) unequip(item.slot);
    else equip(item.slot, item.id);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Cosmetics Store</h1>
            {seasonMeta && (
              <span className={styles.seasonBadge} style={{ '--season-accent': seasonMeta.accent }}>
                <span aria-hidden="true">{seasonMeta.icon}</span> {seasonMeta.label} season
              </span>
            )}
          </div>
          <p className={styles.subtitle}>
            Spend coins on bespoke gear and style your avatar. Higher tiers unlock
            as you level up.
          </p>
        </div>
        <div className={styles.walletBox}>
          <span className={styles.walletCoins}>
            <CoinIcon size={20} /> {coins.toLocaleString()}
          </span>
          <span className={styles.walletLevel}>Level {level}</span>
        </div>
      </header>

      {featured.length > 0 && (
        <section className={styles.featured} aria-label="Featured today">
          <div className={styles.featuredHead}>
            <div>
              <span className={styles.featuredEyebrow}>Featured today</span>
              <p className={styles.featuredBlurb}>
                A rotating pick at <strong>15% off</strong> &mdash; new set every day.
              </p>
            </div>
            <span className={styles.featuredCountdown} title="Featured items rotate at midnight">
              <span aria-hidden="true">&#9201;</span> Rotates in {formatCountdown(countdown)}
            </span>
          </div>
          <ul className={styles.featuredGrid}>
            {featured.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                owned={owned.includes(item.id)}
                equipped={economy.equipped[item.slot] === item.id}
                level={level}
                coins={coins}
                flash={flash?.id === item.id ? flash.kind : null}
                onBuy={() => handleBuy(item)}
                onToggleEquip={() => toggleEquip(item)}
                onPreview={() => setHoverId(item.id)}
                onPreviewEnd={() => setHoverId((cur) => (cur === item.id ? null : cur))}
              />
            ))}
          </ul>
        </section>
      )}

      <div className={styles.layout}>
        <aside className={styles.previewPanel}>
          <div className={styles.previewAvatar}>
            <div ref={stageRef} className={styles.previewStage}>
              <Avatar equipped={previewEquipped} size={200} title="Your avatar" idle allow3D />
            </div>
          </div>
          <div className={styles.collection}>
            <span className={styles.collectionCount}>{ownedCount} / {CATALOG.length}</span>
            <span className={styles.collectionLabel}>items collected</span>
          </div>
          <EquippedList equipped={economy.equipped} onUnequip={unequip} />
        </aside>

        <section className={styles.catalog}>
          <div className={styles.filters} role="tablist" aria-label="Filter by slot">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
              All
            </FilterBtn>
            {SLOTS.map((slot) => (
              <FilterBtn key={slot} active={filter === slot} onClick={() => setFilter(slot)}>
                {slotLabel(slot)}
              </FilterBtn>
            ))}
          </div>

          <ul className={styles.grid}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                owned={owned.includes(item.id)}
                equipped={economy.equipped[item.slot] === item.id}
                level={level}
                coins={coins}
                flash={flash?.id === item.id ? flash.kind : null}
                onBuy={() => handleBuy(item)}
                onToggleEquip={() => toggleEquip(item)}
                onPreview={() => setHoverId(item.id)}
                onPreviewEnd={() => setHoverId((cur) => (cur === item.id ? null : cur))}
              />
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.exclusives} aria-label="Mastery exclusives">
        <div className={styles.exclusivesHead}>
          <span className={styles.featuredEyebrow}>Mastery exclusives</span>
          <p className={styles.featuredBlurb}>
            Earned by mastery, never sold. They don&rsquo;t count toward the
            collection total.
          </p>
        </div>
        <ul className={styles.exclusivesGrid}>
          {MASTERY_COSMETICS.map((item) => (
            <ExclusiveCard
              key={item.id}
              item={item}
              owned={owned.includes(item.id)}
              equipped={economy.equipped[item.slot] === item.id}
              onToggleEquip={() => toggleEquip(item)}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function ExclusiveCard({ item, owned, equipped, onToggleEquip }) {
  const rarity = RARITY_META[item.rarity] || RARITY_META.legendary;
  return (
    <li
      className={`${styles.exclusiveCard} ${owned ? '' : styles.exclusiveLocked}`}
      style={{ '--rarity-color': rarity.color }}
    >
      <div className={styles.cardPreview}>
        <Avatar
          equipped={{ [item.slot]: item.id }}
          size={120}
          idle={owned}
          crop={item.slot === 'headwear' || item.slot === 'eyewear' ? 'bust' : undefined}
        />
        {!owned && (
          <span className={styles.exclusiveLockIcon} aria-hidden="true">
            &#128274;
          </span>
        )}
        <span className={styles.rarityTag} style={{ color: rarity.color }}>
          {owned ? 'Earned' : 'Locked'}
        </span>
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardName}>{item.name}</span>
        <span className={styles.exclusiveUnlock}>{item.condition || item.unlock}</span>
      </div>
      <div className={styles.cardAction}>
        {owned ? (
          <button
            type="button"
            className={`${styles.actionBtn} ${equipped ? styles.equippedBtn : styles.equipBtn}`}
            onClick={onToggleEquip}
          >
            {equipped ? 'Equipped \u2713' : 'Equip'}
          </button>
        ) : (
          <span className={styles.lockBadge}>
            <span aria-hidden="true">&#127942;</span> Earn it
          </span>
        )}
      </div>
    </li>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`${styles.filterBtn} ${active ? styles.filterActive : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EquippedList({ equipped, onUnequip }) {
  const entries = Object.entries(equipped).filter(([, id]) => id && getCosmeticById(id));
  if (entries.length === 0) {
    return <p className={styles.equippedEmpty}>Nothing equipped yet — buy something below!</p>;
  }
  return (
    <ul className={styles.equippedList}>
      {entries.map(([slot, id]) => {
        const item = getCosmeticById(id);
        return (
          <li key={slot} className={styles.equippedItem}>
            <span className={styles.equippedSlot}>{slotLabel(slot)}</span>
            <span className={styles.equippedName}>{item.name}</span>
            <button
              type="button"
              className={styles.unequipBtn}
              onClick={() => onUnequip(slot)}
              aria-label={`Unequip ${item.name}`}
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ItemCard({
  item,
  owned,
  equipped,
  level,
  coins,
  flash,
  onBuy,
  onToggleEquip,
  onPreview,
  onPreviewEnd,
}) {
  const unlocked = level >= item.unlockLevel;
  const price = featuredPrice(item);
  const discounted = price < item.price;
  const affordable = coins >= price;
  const rarity = RARITY_META[item.rarity] || RARITY_META.common;

  let action;
  if (owned) {
    action = (
      <button
        type="button"
        className={`${styles.actionBtn} ${equipped ? styles.equippedBtn : styles.equipBtn}`}
        onClick={onToggleEquip}
      >
        {equipped ? 'Equipped \u2713' : 'Equip'}
      </button>
    );
  } else if (!unlocked) {
    action = (
      <span className={styles.lockBadge}>
        <span aria-hidden="true">&#128274;</span> Unlocks at Lv {item.unlockLevel}
      </span>
    );
  } else {
    action = (
      <button
        type="button"
        className={`${styles.actionBtn} ${styles.buyBtn}`}
        onClick={onBuy}
        disabled={!affordable}
        title={affordable ? undefined : `You need ${price} coins`}
      >
        <CoinIcon size={15} />{' '}
        {discounted ? (
          <>
            <span className={styles.priceWas}>{item.price}</span> {price}
          </>
        ) : (
          price
        )}
      </button>
    );
  }

  return (
    <li
      className={`${styles.card} ${flash === 'bought' ? styles.cardFlash : ''} ${
        !owned && !unlocked ? styles.cardLocked : ''
      }`}
      style={{ '--rarity-color': rarity.color }}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreview}
      onBlur={onPreviewEnd}
    >
      <div className={styles.cardPreview}>
        <Avatar
          equipped={{ [item.slot]: item.id }}
          size={120}
          idle
          allow3D={item.slot === 'skin'}
          crop={item.slot === 'headwear' || item.slot === 'eyewear' ? 'bust' : undefined}
        />
        <span className={styles.rarityTag} style={{ color: rarity.color }}>
          {rarity.label}
        </span>
        {discounted && <span className={styles.featuredTag}>&minus;15%</span>}
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardName}>{item.name}</span>
        <span className={styles.cardSlot}>{slotLabel(item.slot)}</span>
      </div>
      <div className={styles.cardAction}>{action}</div>
    </li>
  );
}
