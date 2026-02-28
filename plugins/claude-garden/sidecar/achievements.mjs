// Claude Garden — Achievement definitions + check logic

import { ALL_CLAUDES } from './claudes.mjs';
import { FACILITY_KEYS } from './facilities.mjs';
import { isDiscovered, getDiscoveredIds } from './game.mjs';

export const CATEGORIES = {
  collection: { name: 'Collection', icon: '{}' },
  economy:    { name: 'Economy',    icon: '$$' },
  upgrades:   { name: 'Upgrades',   icon: '^^' },
  session:    { name: 'Session',    icon: '##' },
  behavior:   { name: 'Behavior',   icon: '~~' },
};

export const ACHIEVEMENTS = [
  // ─── Collection ───
  {
    id: 'first_catch', name: 'First Contact', icon: '[!]',
    category: 'collection',
    check: (p) => p.stats.totalCollected >= 1,
  },
  {
    id: 'collect_5', name: 'Getting Started', icon: '[5]',
    category: 'collection',
    check: (p) => getDiscoveredIds(p.collection).length >= 5,
  },
  {
    id: 'collect_10', name: 'Halfway There', icon: '[H]',
    category: 'collection',
    check: (p) => getDiscoveredIds(p.collection).length >= 10,
  },
  {
    id: 'collect_20', name: 'Seasoned Collector', icon: '[S]',
    category: 'collection',
    check: (p) => getDiscoveredIds(p.collection).length >= 20,
  },
  {
    id: 'collect_all', name: 'Gotta Catch Em All', icon: '{*}',
    category: 'collection',
    check: (p) => {
      const nonSecret = ALL_CLAUDES.filter(c => !c.secret);
      return nonSecret.every(c => isDiscovered(p.collection, c.id));
    },
  },
  {
    id: 'first_rare', name: 'Rare Find', icon: '<R>',
    category: 'collection',
    check: (p) => ALL_CLAUDES.some(c => c.rarity >= 3 && isDiscovered(p.collection, c.id)),
  },
  {
    id: 'first_epic', name: 'Epic Discovery', icon: '<E>',
    category: 'collection',
    check: (p) => ALL_CLAUDES.some(c => c.rarity >= 4 && isDiscovered(p.collection, c.id)),
  },
  {
    id: 'first_legendary', name: 'Legendary Encounter', icon: '<L>',
    category: 'collection',
    check: (p) => ALL_CLAUDES.some(c => c.rarity === 5 && isDiscovered(p.collection, c.id)),
  },

  // ─── Economy ───
  {
    id: 'earn_100', name: 'Pocket Change', icon: '$1$',
    category: 'economy',
    check: (p) => p.totalCoins >= 100,
  },
  {
    id: 'earn_500', name: 'Making Bank', icon: '$5$',
    category: 'economy',
    check: (p) => p.totalCoins >= 500,
  },
  {
    id: 'earn_2000', name: 'Claude Tycoon', icon: '$$$',
    category: 'economy',
    check: (p) => p.totalCoins >= 2000,
  },
  {
    id: 'lucky_coins', name: 'Lucky Seven', icon: '777',
    category: 'economy',
    check: (p) => p.coins === 777,
  },

  // ─── Upgrades ───
  {
    id: 'first_upgrade', name: 'Level Up!', icon: '[^]',
    category: 'upgrades',
    check: (p) => FACILITY_KEYS.some(k => p.facilities[k] > 1),
  },
  {
    id: 'max_facility', name: 'Maxed Out', icon: '[M]',
    category: 'upgrades',
    check: (p) => FACILITY_KEYS.some(k => p.facilities[k] >= 5),
  },
  {
    id: 'max_all', name: 'Full Power', icon: '{M}',
    category: 'upgrades',
    check: (p) => FACILITY_KEYS.every(k => p.facilities[k] >= 5),
  },

  // ─── Session ───
  {
    id: 'sessions_10', name: 'Regular', icon: '#10',
    category: 'session',
    check: (p) => p.stats.sessionsPlayed >= 10,
  },
  {
    id: 'sessions_50', name: 'Dedicated', icon: '#50',
    category: 'session',
    check: (p) => p.stats.sessionsPlayed >= 50,
  },

  // ─── Behavior ───
  {
    id: 'garden_full', name: 'Full House', icon: '[=]',
    category: 'behavior',
    check: (p, game) => game && game.garden.length >= game._capacity,
  },
  {
    id: 'first_dup', name: 'Deja Vu', icon: '[2]',
    category: 'behavior',
    check: (p) => Object.values(p.collection).some(info => info.count >= 2),
  },
];

export function checkAchievements(persistent, game) {
  const unlocked = persistent.achievements || [];
  const newUnlocks = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlocked.includes(ach.id)) continue;
    try {
      if (ach.check(persistent, game)) {
        newUnlocks.push(ach.id);
      }
    } catch { /* ignore check errors */ }
  }

  return newUnlocks;
}

export function getVisibleAchievements() {
  return ACHIEVEMENTS;
}

export function getAchievement(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}
