/**
 * Catalog manifest for the 50 bespoke avatar cosmetics. Pure data consumed by
 * the store/economy: each entry's `id` matches a key in ITEM_COMPONENTS
 * (./index.js). `slot` is one of headwear | eyewear | top | bottom | accessory.
 * `rarity` is one of common | rare | epic | legendary.
 */
export const COSMETIC_ITEMS = [
  // headwear (12)
  { id: 'top-hat', name: 'Top Hat', slot: 'headwear', rarity: 'rare' },
  { id: 'graduation-cap', name: 'Graduation Cap', slot: 'headwear', rarity: 'rare' },
  { id: 'beanie', name: 'Knit Beanie', slot: 'headwear', rarity: 'common' },
  { id: 'crown', name: 'Royal Crown', slot: 'headwear', rarity: 'legendary' },
  { id: 'wizard-hat', name: 'Wizard Hat', slot: 'headwear', rarity: 'epic' },
  { id: 'party-hat', name: 'Party Hat', slot: 'headwear', rarity: 'common' },
  { id: 'beret', name: 'Artist Beret', slot: 'headwear', rarity: 'rare' },
  { id: 'cowboy-hat', name: 'Cowboy Hat', slot: 'headwear', rarity: 'rare' },
  { id: 'baseball-cap', name: 'Baseball Cap', slot: 'headwear', rarity: 'common' },
  { id: 'flask-helmet', name: 'Flask Helmet', slot: 'headwear', rarity: 'epic' },
  { id: 'headband', name: 'Sport Headband', slot: 'headwear', rarity: 'common' },
  { id: 'halo', name: 'Glowing Halo', slot: 'headwear', rarity: 'legendary' },
  // eyewear (8)
  { id: 'round-glasses', name: 'Round Glasses', slot: 'eyewear', rarity: 'common' },
  { id: 'sunglasses', name: 'Sunglasses', slot: 'eyewear', rarity: 'common' },
  { id: 'lab-goggles', name: 'Lab Goggles', slot: 'eyewear', rarity: 'rare' },
  { id: 'monocle', name: 'Monocle', slot: 'eyewear', rarity: 'rare' },
  { id: 'three-d-glasses', name: '3D Glasses', slot: 'eyewear', rarity: 'common' },
  { id: 'star-shades', name: 'Star Shades', slot: 'eyewear', rarity: 'epic' },
  { id: 'visor', name: 'Tech Visor', slot: 'eyewear', rarity: 'rare' },
  { id: 'safety-specs', name: 'Safety Specs', slot: 'eyewear', rarity: 'common' },
  // tops (12)
  { id: 'lab-coat', name: 'Lab Coat', slot: 'top', rarity: 'rare' },
  { id: 'hoodie', name: 'Hoodie', slot: 'top', rarity: 'common' },
  { id: 'tee', name: 'Graphic Tee', slot: 'top', rarity: 'common' },
  { id: 'sweater', name: 'Cozy Sweater', slot: 'top', rarity: 'common' },
  { id: 'tuxedo', name: 'Tuxedo', slot: 'top', rarity: 'legendary' },
  { id: 'varsity-jacket', name: 'Varsity Jacket', slot: 'top', rarity: 'rare' },
  { id: 'flannel', name: 'Flannel Shirt', slot: 'top', rarity: 'common' },
  { id: 'tank-top', name: 'Tank Top', slot: 'top', rarity: 'common' },
  { id: 'raincoat', name: 'Raincoat', slot: 'top', rarity: 'rare' },
  { id: 'polo', name: 'Polo Shirt', slot: 'top', rarity: 'common' },
  { id: 'puffer-vest', name: 'Puffer Vest', slot: 'top', rarity: 'rare' },
  { id: 'turtleneck', name: 'Turtleneck', slot: 'top', rarity: 'common' },
  // bottoms (9)
  { id: 'jeans', name: 'Blue Jeans', slot: 'bottom', rarity: 'common' },
  { id: 'shorts', name: 'Shorts', slot: 'bottom', rarity: 'common' },
  { id: 'skirt', name: 'Pleated Skirt', slot: 'bottom', rarity: 'common' },
  { id: 'cargo-pants', name: 'Cargo Pants', slot: 'bottom', rarity: 'rare' },
  { id: 'sweatpants', name: 'Sweatpants', slot: 'bottom', rarity: 'common' },
  { id: 'kilt', name: 'Tartan Kilt', slot: 'bottom', rarity: 'epic' },
  { id: 'overalls', name: 'Overalls', slot: 'bottom', rarity: 'rare' },
  { id: 'track-pants', name: 'Track Pants', slot: 'bottom', rarity: 'common' },
  { id: 'slacks', name: 'Slacks', slot: 'bottom', rarity: 'common' },
  // accessories (9)
  { id: 'backpack', name: 'Backpack', slot: 'accessory', rarity: 'common' },
  { id: 'scarf', name: 'Knit Scarf', slot: 'accessory', rarity: 'common' },
  { id: 'bowtie', name: 'Bow Tie', slot: 'accessory', rarity: 'rare' },
  { id: 'medal-necklace', name: 'Medal Necklace', slot: 'accessory', rarity: 'epic' },
  { id: 'headphones', name: 'Headphones', slot: 'accessory', rarity: 'rare' },
  { id: 'cape', name: 'Hero Cape', slot: 'accessory', rarity: 'legendary' },
  { id: 'wristband', name: 'Wristband', slot: 'accessory', rarity: 'common' },
  { id: 'pin-badge', name: 'Pin Badge', slot: 'accessory', rarity: 'common' },
  { id: 'satchel', name: 'Leather Satchel', slot: 'accessory', rarity: 'rare' },
  // skin (1) — a fully-3D, real-time rendered avatar. `is3D` makes the renderer
  // swap the layered SVG for a three.js blob-human. Explicit price/unlockLevel
  // mark it as the rarest, end-game collectible (overrides the rarity defaults).
  {
    id: 'aurora-blob',
    name: 'Aurora Blob (3D)',
    slot: 'skin',
    rarity: 'legendary',
    is3D: true,
    price: 5000,
    unlockLevel: 20,
  },
];
