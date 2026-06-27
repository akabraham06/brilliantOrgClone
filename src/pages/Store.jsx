import { useEffect, useMemo, useRef, useState } from 'react';
import { useEconomy } from '../context/EconomyContext.jsx';
import { usePrefersReducedMotion } from '../components/interactions/lib/motion.js';
import {
  CATALOG,
  SLOTS,
  slotLabel,
  RARITY_META,
  getCosmeticById,
} from '../data/cosmetics.js';
import Avatar from '../components/avatar/Avatar.jsx';
import CoinIcon from '../components/economy/CoinIcon.jsx';
import styles from './Store.module.css';

/**
 * Cosmetics Store: preview your avatar, browse the 50-item catalog by slot, and
 * buy / equip items. Buying and equipping persist to the account-level economy
 * (users/{uid}.economy) via EconomyContext, with level + coin gating enforced
 * there too.
 */
export default function Store() {
  const { economy, coins, level, buy, equip, unequip } = useEconomy();
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
          <h1 className={styles.title}>Cosmetics Store</h1>
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
    </div>
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
  const affordable = coins >= item.price;
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
        title={affordable ? undefined : `You need ${item.price} coins`}
      >
        <CoinIcon size={15} /> {item.price}
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
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardName}>{item.name}</span>
        <span className={styles.cardSlot}>{slotLabel(item.slot)}</span>
      </div>
      <div className={styles.cardAction}>{action}</div>
    </li>
  );
}
