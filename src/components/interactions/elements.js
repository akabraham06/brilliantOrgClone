/**
 * Lightweight element data for the first 20 elements - enough for the MVP's
 * atom diagrams, mini periodic table, shell builder, and molar-mass lookups.
 */
export const ELEMENTS = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, period: 1, group: 1, category: 'nonmetal' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.003, period: 1, group: 18, category: 'nonmetal' },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, period: 2, group: 1, category: 'metal' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, period: 2, group: 2, category: 'metal' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, period: 2, group: 13, category: 'metalloid' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, period: 2, group: 14, category: 'nonmetal' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, period: 2, group: 15, category: 'nonmetal' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, period: 2, group: 16, category: 'nonmetal' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, period: 2, group: 17, category: 'nonmetal' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, period: 2, group: 18, category: 'nonmetal' },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.99, period: 3, group: 1, category: 'metal' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, period: 3, group: 2, category: 'metal' },
  { number: 13, symbol: 'Al', name: 'Aluminum', mass: 26.982, period: 3, group: 13, category: 'metal' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, period: 3, group: 14, category: 'metalloid' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, period: 3, group: 15, category: 'nonmetal' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, period: 3, group: 16, category: 'nonmetal' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, period: 3, group: 17, category: 'nonmetal' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, period: 3, group: 18, category: 'nonmetal' },
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, period: 4, group: 1, category: 'metal' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, period: 4, group: 2, category: 'metal' },
];

export const CATEGORY_LABEL = {
  metal: 'Metal',
  nonmetal: 'Nonmetal',
  metalloid: 'Metalloid',
};

export function getElement(atomicNumber) {
  return ELEMENTS.find((e) => e.number === atomicNumber) || null;
}

export function getElementBySymbol(symbol) {
  return ELEMENTS.find((e) => e.symbol === symbol) || null;
}

/** Valence electrons for main-group elements (He is the exception at 2). */
export function valenceElectrons(element) {
  if (!element) return 0;
  if (element.symbol === 'He') return 2;
  const g = element.group;
  if (g === 1) return 1;
  if (g === 2) return 2;
  if (g >= 13) return g - 10;
  return 0;
}

/** Distributes `count` electrons across shells using the 2, 8, 8, 2 pattern. */
export function shellConfig(count) {
  const capacities = [2, 8, 8, 2];
  const shells = [];
  let remaining = count;
  for (const cap of capacities) {
    if (remaining <= 0) break;
    const placed = Math.min(cap, remaining);
    shells.push(placed);
    remaining -= placed;
  }
  return shells;
}
