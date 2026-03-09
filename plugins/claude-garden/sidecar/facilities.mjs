// Claude Garden — Facility upgrade definitions

export const FACILITIES = {
  gpu: {
    name: 'GPU',
    icon: '>>',
    desc: 'Coins per tool',
    maxLevel: 10,
    levels: [
      { value: 1,  cost: 0 },       // Lv.1
      { value: 2,  cost: 50 },      // Lv.2
      { value: 3,  cost: 150 },     // Lv.3
      { value: 5,  cost: 400 },     // Lv.4
      { value: 8,  cost: 1000 },    // Lv.5
      { value: 12, cost: 2500 },    // Lv.6
      { value: 17, cost: 6000 },    // Lv.7
      { value: 24, cost: 15000 },   // Lv.8
      { value: 33, cost: 35000 },   // Lv.9
      { value: 45, cost: 80000 },   // Lv.10
    ],
  },
  ram: {
    name: 'RAM',
    icon: '[]',
    desc: 'Garden slots',
    maxLevel: 10,
    levels: [
      { value: 8,   cost: 0 },
      { value: 12,  cost: 80 },
      { value: 18,  cost: 250 },
      { value: 25,  cost: 600 },
      { value: 35,  cost: 1500 },
      { value: 50,  cost: 4000 },
      { value: 70,  cost: 10000 },
      { value: 99,  cost: 25000 },
      { value: 140, cost: 60000 },
      { value: 200, cost: 150000 },
    ],
  },
  cooling: {
    name: 'Cooling',
    icon: '~~',
    desc: 'Rare multiplier',
    maxLevel: 10,
    levels: [
      { value: 1.0,  cost: 0 },
      { value: 1.5,  cost: 100 },
      { value: 2.0,  cost: 300 },
      { value: 3.0,  cost: 800 },
      { value: 5.0,  cost: 2000 },
      { value: 7.5,  cost: 5000 },
      { value: 11.0, cost: 12000 },
      { value: 16.0, cost: 30000 },
      { value: 23.0, cost: 70000 },
      { value: 32.0, cost: 160000 },
    ],
  },
  antenna: {
    name: 'Antenna',
    icon: 'Y>',
    desc: 'Max rarity',
    maxLevel: 5,
    levels: [
      { value: 1, cost: 0 },
      { value: 2, cost: 500 },
      { value: 3, cost: 5000 },
      { value: 4, cost: 30000 },
      { value: 5, cost: 100000 },
    ],
  },
};

export const FACILITY_KEYS = ['gpu', 'ram', 'cooling', 'antenna'];

export function getFacilityValue(key, level) {
  return FACILITIES[key].levels[level - 1].value;
}

export function getUpgradeCost(key, currentLevel) {
  if (currentLevel >= FACILITIES[key].maxLevel) return null;
  return FACILITIES[key].levels[currentLevel].cost;
}
