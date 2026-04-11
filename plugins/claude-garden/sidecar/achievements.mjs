// Claude Garden — Achievement definitions + check logic

import { ALL_CLAUDES } from './claudes.mjs';
import { FACILITY_KEYS } from './facilities.mjs';
import { isDiscovered, getDiscoveredIds } from './game.mjs';

export const CATEGORIES = {
  collection: { name: 'Collection', icon: '{}' },
  mastery:    { name: 'Mastery',    icon: '<>' },
  economy:    { name: 'Economy',    icon: '$$' },
  upgrades:   { name: 'Upgrades',   icon: '^^' },
  session:    { name: 'Session',    icon: '##' },
  behavior:   { name: 'Behavior',   icon: '~~' },
  gacha:      { name: 'Gacha',      icon: '**' },
  streak:     { name: 'Streak',    icon: '>>' },
};

export const ACHIEVEMENTS = [
  // ─── Collection ───
  {
    id: 'first_catch', name: 'First Contact', icon: '[!]',
    category: 'collection',
    desc: 'Collect your first Claude.',
    hint: 'Use tools and press Space.',
    check: (p) => p.stats.totalCollected >= 1,
  },
  {
    id: 'collect_5', name: 'Getting Started', icon: '[5]',
    category: 'collection',
    desc: 'Discover 5 unique Claudes.',
    hint: 'Keep working — new types appear.',
    check: (p) => getDiscoveredIds(p.collection).length >= 5,
  },
  {
    id: 'collect_10', name: 'Halfway There', icon: '[H]',
    category: 'collection',
    desc: 'Discover 10 unique Claudes.',
    hint: 'Upgrade Antenna for rarer finds.',
    check: (p) => getDiscoveredIds(p.collection).length >= 10,
  },
  {
    id: 'collect_20', name: 'Seasoned Collector', icon: '[S]',
    category: 'collection',
    desc: 'Discover 20 unique Claudes.',
    hint: 'Some appear only at certain times...',
    check: (p) => getDiscoveredIds(p.collection).length >= 20,
  },
  {
    id: 'collect_all', name: 'Gotta Catch Em All', icon: '{*}',
    category: 'collection',
    desc: 'Discover every non-secret Claude.',
    hint: 'Try different times, long sessions...',
    check: (p) => {
      const nonSecret = ALL_CLAUDES.filter(c => !c.secret);
      return nonSecret.every(c => isDiscovered(p.collection, c.id));
    },
  },
  {
    id: 'first_rare', name: 'Rare Find', icon: '<R>',
    category: 'collection',
    desc: 'Discover a Rare (or higher) Claude.',
    hint: 'Upgrade Cooling for better odds.',
    check: (p) => ALL_CLAUDES.some(c => c.rarity >= 3 && isDiscovered(p.collection, c.id)),
  },
  {
    id: 'first_epic', name: 'Epic Discovery', icon: '<E>',
    category: 'collection',
    desc: 'Discover an Epic (or higher) Claude.',
    hint: 'Antenna Lv.4+ unlocks Epic tier.',
    check: (p) => ALL_CLAUDES.some(c => c.rarity >= 4 && isDiscovered(p.collection, c.id)),
  },
  {
    id: 'first_legendary', name: 'Legendary Encounter', icon: '<L>',
    category: 'collection',
    desc: 'Discover a Legendary Claude.',
    hint: 'Max Antenna. Then pray.',
    check: (p) => ALL_CLAUDES.some(c => c.rarity === 5 && isDiscovered(p.collection, c.id)),
  },

  // ─── Mastery (rarity completion → titles) ───
  {
    id: 'common_master', name: 'Common Master', icon: '<C>',
    category: 'mastery',
    desc: 'Discover every Common Claude.',
    hint: 'Collect all white-star Claudes.',
    title: 'Beginner',
    check: (p) => ALL_CLAUDES.filter(c => c.rarity === 1 && !c.secret).every(c => isDiscovered(p.collection, c.id)),
  },
  {
    id: 'uncommon_master', name: 'Uncommon Master', icon: '<U>',
    category: 'mastery',
    desc: 'Discover every Uncommon Claude.',
    hint: 'Some appear only on weekends or early mornings.',
    title: 'Collector',
    check: (p) => ALL_CLAUDES.filter(c => c.rarity === 2 && !c.secret).every(c => isDiscovered(p.collection, c.id)),
  },
  {
    id: 'rare_master', name: 'Rare Master', icon: '<R>',
    category: 'mastery',
    desc: 'Discover every Rare Claude.',
    hint: 'Upgrade Antenna and Cooling. Night has secrets.',
    title: 'Hunter',
    check: (p) => ALL_CLAUDES.filter(c => c.rarity === 3 && !c.secret).every(c => isDiscovered(p.collection, c.id)),
  },
  {
    id: 'epic_master', name: 'Epic Master', icon: '<E>',
    category: 'mastery',
    desc: 'Discover every Epic Claude.',
    hint: 'Antenna Lv.4+. Patience is a virtue.',
    title: 'Connoisseur',
    check: (p) => ALL_CLAUDES.filter(c => c.rarity === 4 && !c.secret).every(c => isDiscovered(p.collection, c.id)),
  },
  {
    id: 'legendary_master', name: 'Legendary Master', icon: '<L>',
    category: 'mastery',
    desc: 'Discover every Legendary Claude.',
    hint: 'Max Antenna. Some need special conditions.',
    title: 'Legend',
    check: (p) => ALL_CLAUDES.filter(c => c.rarity === 5 && !c.secret).every(c => isDiscovered(p.collection, c.id)),
  },
  {
    id: 'grand_master', name: 'Grand Master', icon: '{G}',
    category: 'mastery',
    desc: 'Discover every non-secret Claude.',
    hint: 'Complete all five rarity tiers.',
    title: 'Grand Master',
    check: (p) => ALL_CLAUDES.filter(c => !c.secret).every(c => isDiscovered(p.collection, c.id)),
  },

  // ─── Economy ───
  {
    id: 'earn_100', name: 'Pocket Change', icon: '$1$',
    category: 'economy',
    desc: 'Earn 100 total coins.',
    hint: 'Upgrade GPU for more coins per tool.',
    check: (p) => p.totalCoins >= 100,
  },
  {
    id: 'earn_500', name: 'Making Bank', icon: '$5$',
    category: 'economy',
    desc: 'Earn 500 total coins.',
    hint: 'Keep coding!',
    check: (p) => p.totalCoins >= 500,
  },
  {
    id: 'earn_2000', name: 'Claude Tycoon', icon: '$$$',
    category: 'economy',
    desc: 'Earn 2,000 total coins.',
    hint: 'Duplicates give bonus coins too.',
    check: (p) => p.totalCoins >= 2000,
  },
  {
    id: 'earn_10000', name: 'Coin Hoarder', icon: '$M$',
    category: 'economy',
    desc: 'Earn 10,000 total coins.',
    hint: 'GPU upgrades compound fast.',
    check: (p) => p.totalCoins >= 10000,
  },
  {
    id: 'lucky_coins', name: 'Lucky Seven', icon: '777',
    category: 'economy',
    desc: 'Have exactly 777 coins.',
    hint: 'An exact balance of 777...',
    check: (p) => p.coins === 777,
  },

  // ─── Upgrades ───
  {
    id: 'first_upgrade', name: 'Level Up!', icon: '[^]',
    category: 'upgrades',
    desc: 'Upgrade any facility.',
    hint: 'Press [1-4] on the upgrades screen.',
    check: (p) => FACILITY_KEYS.some(k => p.facilities[k] > 1),
  },
  {
    id: 'max_facility', name: 'Maxed Out', icon: '[M]',
    category: 'upgrades',
    desc: 'Max out any facility.',
    hint: 'Push one facility to the limit.',
    check: (p) => FACILITY_KEYS.some(k => p.facilities[k] >= 10),
  },
  {
    id: 'max_all', name: 'Full Power', icon: '{M}',
    category: 'upgrades',
    desc: 'Max out all facilities.',
    hint: 'Every facility at max level.',
    check: (p) => FACILITY_KEYS.every(k => {
      const max = k === 'antenna' ? 5 : 10;
      return p.facilities[k] >= max;
    }),
  },

  // ─── Session ───
  {
    id: 'sessions_10', name: 'Regular', icon: '#10',
    category: 'session',
    desc: 'Play 10 sessions.',
    hint: 'Come back often.',
    check: (p) => p.stats.sessionsPlayed >= 10,
  },
  {
    id: 'sessions_50', name: 'Dedicated', icon: '#50',
    category: 'session',
    desc: 'Play 50 sessions.',
    hint: 'A true garden regular.',
    check: (p) => p.stats.sessionsPlayed >= 50,
  },
  {
    id: 'sessions_100', name: 'Obsessed', icon: '###',
    category: 'session',
    desc: 'Play 100 sessions.',
    hint: 'Can you stop?',
    check: (p) => p.stats.sessionsPlayed >= 100,
  },

  // ─── Behavior ───
  {
    id: 'garden_full', name: 'Full House', icon: '[=]',
    category: 'behavior',
    desc: 'Fill your garden to capacity.',
    hint: 'Let Claudes pile up without collecting.',
    check: (p, game) => game && game.garden.length >= game._capacity,
  },
  {
    id: 'first_dup', name: 'Deja Vu', icon: '[2]',
    category: 'behavior',
    desc: 'Collect a duplicate Claude.',
    hint: 'Same Claude twice = bonus coins.',
    check: (p) => Object.values(p.collection).some(info => info.count >= 2),
  },
  {
    id: 'find_conditional', name: 'Right Place, Right Time', icon: '[?]',
    category: 'behavior',
    desc: 'Discover a conditional Claude.',
    hint: 'Some only appear at night, weekends...',
    check: (p) => ALL_CLAUDES.some(c => c.condition && isDiscovered(p.collection, c.id)),
  },

  // ─── Gacha ───
  {
    id: 'first_gacha', name: 'First Pull', icon: '*1*',
    category: 'gacha',
    desc: 'Roll the gacha for the first time.',
    hint: 'Visit the Gacha tab and try your luck.',
    check: (p) => p.gacha && p.gacha.totalPulls >= 1,
  },
  {
    id: 'gacha_10', name: 'Getting Hooked', icon: '*X*',
    category: 'gacha',
    desc: 'Roll the gacha 10 times.',
    hint: 'One more pull...',
    check: (p) => p.gacha && p.gacha.totalPulls >= 10,
  },
  {
    id: 'gacha_100', name: 'Gambling Problem', icon: '***',
    category: 'gacha',
    desc: 'Roll the gacha 100 times.',
    hint: 'You can stop anytime, right?',
    check: (p) => p.gacha && p.gacha.totalPulls >= 100,
  },
  {
    id: 'gacha_pity_epic', name: 'Pity Party', icon: '*E*',
    category: 'gacha',
    desc: 'Hit the Epic pity ceiling (30 pulls).',
    hint: 'Sometimes luck just isn\'t there.',
    check: (p) => p.gacha && p.gacha._hitPityEpic,
  },
  {
    id: 'gacha_pity_legendary', name: 'Rock Bottom', icon: '*L*',
    category: 'gacha',
    desc: 'Hit the Legendary pity ceiling (80 pulls).',
    hint: 'The ultimate unlucky streak.',
    check: (p) => p.gacha && p.gacha._hitPityLegendary,
  },

  // ─── Streak ───
  {
    id: 'streak_3', name: 'Getting Started', icon: '>3>',
    category: 'streak',
    desc: '3-day streak.',
    hint: 'Come back 3 days in a row.',
    check: (p) => p.streak && p.streak.max >= 3,
  },
  {
    id: 'streak_7', name: 'One Week', icon: '>7>',
    category: 'streak',
    desc: '7-day streak.',
    hint: 'A full week of dedication.',
    check: (p) => p.streak && p.streak.max >= 7,
  },
  {
    id: 'streak_30', name: 'No Days Off', icon: '>>>',
    category: 'streak',
    desc: '30-day streak.',
    hint: 'A whole month. Respect.',
    title: 'Devoted',
    check: (p) => p.streak && p.streak.max >= 30,
  },
];

export function checkAchievements(persistent, game) {
  const unlocked = persistent.achievements || {};
  // Migration: array → object
  if (Array.isArray(unlocked)) {
    const now = new Date().toISOString().slice(0, 10);
    const migrated = {};
    for (const id of unlocked) {
      migrated[id] = { unlockedAt: now };
    }
    persistent.achievements = migrated;
    return checkAchievements(persistent, game);
  }

  const newUnlocks = [];

  for (const ach of ACHIEVEMENTS) {
    if (ach.id in unlocked) continue;
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

// Title system — achievements with `title` field grant equippable titles
export function getTitleAchievements() {
  return ACHIEVEMENTS.filter(a => a.title);
}

export function getEquippedTitle(persistent) {
  const titleId = persistent.selectedTitle;
  if (!titleId) return null;
  const ach = ACHIEVEMENTS.find(a => a.id === titleId);
  if (!ach || !ach.title) return null;
  // Must be unlocked
  const unlocked = persistent.achievements || {};
  if (Array.isArray(unlocked) ? !unlocked.includes(titleId) : !(titleId in unlocked)) return null;
  return ach.title;
}
