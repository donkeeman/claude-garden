// Claude Garden — Game state machine

import { ALL_CLAUDES, RARITY_STARS, DUP_BONUS } from './claudes.mjs';
import { FACILITIES, FACILITY_KEYS, getFacilityValue, getUpgradeCost } from './facilities.mjs';
import { checkAchievements, getAchievement, getTitleAchievements } from './achievements.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Store state in version-independent path to survive plugin updates
const STATE_DIR = join(homedir(), '.claude', 'claude-garden');
const STATE_PATH = join(STATE_DIR, 'state.json');
const STATE_BACKUP_PATH = join(STATE_DIR, 'state.json.bak');
const STATE_TMP_PATH = join(STATE_DIR, 'state.json.tmp');
const LEGACY_STATE_PATH = join(__dirname, '..', 'state.json');

// Rarity spawn weights (before cooling multiplier)
const BASE_WEIGHTS = { 1: 100, 2: 20, 3: 5, 4: 1, 5: 0.1 };
const SPAWN_CHANCE = 0.55; // 55% per tool call

// Gacha system
const GACHA_COST = 200;
const GACHA_WEIGHTS = { 1: 50, 2: 30, 3: 14, 4: 5, 5: 1 };
const GACHA_PITY_EPIC = 30;
const GACHA_PITY_LEGENDARY = 80;

function tryLoadStateFile(path) {
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, 'utf-8');
    if (raw.trim().length === 0) return null;
    return migrateState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function loadState() {
  // Ensure state directory exists
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });

  // Try primary state file
  const primary = tryLoadStateFile(STATE_PATH);
  if (primary) return primary;

  // Primary missing/corrupt — fall back to backup
  const backup = tryLoadStateFile(STATE_BACKUP_PATH);
  if (backup) {
    // Restore backup as primary
    saveState(backup);
    return backup;
  }

  // Migrate from legacy version-specific path
  if (existsSync(LEGACY_STATE_PATH)) {
    try {
      const state = JSON.parse(readFileSync(LEGACY_STATE_PATH, 'utf-8'));
      const migrated = migrateState(state);
      saveState(migrated);
      try { unlinkSync(LEGACY_STATE_PATH); } catch {}
      return migrated;
    } catch {}
  }

  return createDefaultState();
}

// 구버전(collection: string[]) → 신버전(collection: { [id]: { count, firstSeen } }) 마이그레이션
function migrateState(state) {
  if (Array.isArray(state.collection)) {
    const now = new Date().toISOString().slice(0, 10);
    const migrated = {};
    for (const id of state.collection) {
      migrated[id] = { count: 1, firstSeen: now };
    }
    state.collection = migrated;
  }
  if (!state.achievements) state.achievements = [];
  if (!state.gacha) state.gacha = { pity: { epic: 0, legendary: 0 }, totalPulls: 0 };
  if (state.selectedTitle === undefined) state.selectedTitle = null;
  if (state.nickname === undefined) state.nickname = null;
  if (state.favoriteClaude === undefined) state.favoriteClaude = null;
  if (!state.streak) state.streak = { current: 0, lastCheckIn: null, max: 0 };
  return state;
}

function createDefaultState() {
  return {
    coins: 0,
    totalCoins: 0,
    facilities: { gpu: 1, ram: 1, cooling: 1, antenna: 1 },
    collection: {},  // { [claudeId]: { count: number, firstSeen: 'YYYY-MM-DD' } }
    stats: { totalCollected: 0, totalSpawned: 0, sessionsPlayed: 0 },
    achievements: {},
    gacha: { pity: { epic: 0, legendary: 0 }, totalPulls: 0 },
    selectedTitle: null,  // achievement ID with title field
    nickname: null,       // string, max 16 chars
    favoriteClaude: null, // cloud ID from collection
    streak: { current: 0, lastCheckIn: null, max: 0 },
  };
}

// Atomic save: write to .tmp, rotate current → .bak, rename .tmp → primary.
// If any step fails (e.g. ENOSPC), the existing state.json is left untouched
// and the user can recover from state.json.bak on next load.
function saveState(state) {
  const data = JSON.stringify(state, null, 2);
  try {
    writeFileSync(STATE_TMP_PATH, data);
    if (existsSync(STATE_PATH)) {
      if (existsSync(STATE_BACKUP_PATH)) {
        try { unlinkSync(STATE_BACKUP_PATH); } catch {}
      }
      renameSync(STATE_PATH, STATE_BACKUP_PATH);
    }
    renameSync(STATE_TMP_PATH, STATE_PATH);
  } catch {
    if (existsSync(STATE_TMP_PATH)) {
      try { unlinkSync(STATE_TMP_PATH); } catch {}
    }
  }
}

// 발견된 클로드 ID 목록 (순서 유지)
export function getDiscoveredIds(collection) {
  return Object.keys(collection);
}

// 특정 클로드가 발견되었는지
export function isDiscovered(collection, id) {
  return id in collection;
}

// Local date string (YYYY-MM-DD) for streak comparison
function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function checkStreak(persistent) {
  const today = getLocalDate();
  const streak = persistent.streak;
  if (streak.lastCheckIn === today) return false; // already checked in

  if (streak.lastCheckIn) {
    // Check if yesterday
    const last = new Date(streak.lastCheckIn + 'T00:00:00');
    const now = new Date(today + 'T00:00:00');
    const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak.current++;
    } else {
      streak.current = 1; // gap > 1 day, reset
    }
  } else {
    streak.current = 1; // first check-in
  }

  streak.lastCheckIn = today;
  if (streak.current > streak.max) streak.max = streak.current;
  return true; // new check-in happened
}

export function createGame(sessionId) {
  const persistent = loadState();
  persistent.stats.sessionsPlayed++;
  const isNewDay = checkStreak(persistent);
  saveState(persistent);

  const game = {
    sessionId,
    persistent,
    garden: [],          // { claude, isNew } — Claudes currently in garden
    actionLog: [],       // recent action messages
    screen: 'garden',    // 'garden' | 'collection' | 'upgrades' | 'achievements'
    detailClaude: null,  // for collection detail view
    cursor: 0,           // 컬렉션 리스트 커서 위치
    achievementScroll: 0,
    achievementCursor: 0,
    sessionStart: Date.now(),
    consecutiveBash: 0,  // consecutive Bash tool calls
    consecutiveFails: 0, // consecutive tool failures
  };

  if (isNewDay) {
    const s = persistent.streak;
    game.actionLog.push(`Day ${s.current} streak!${s.current >= 3 ? ' Keep it up!' : ''}`);
  }

  checkAndNotifyAchievements(game);
  return game;
}

// Condition checkers — each returns true if the condition is met
const CONDITIONS = {
  nightowl: () => {
    const h = new Date().getHours();
    return h >= 22;
  },
  weekend: () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  },
  earlybird: () => {
    const h = new Date().getHours();
    return h >= 5 && h < 8;
  },
  vampire: () => {
    const h = new Date().getHours();
    return h >= 0 && h < 5;
  },
  debugger: (game) => game.consecutiveBash >= 5,
  overworked: (game) => (Date.now() - game.sessionStart) >= 3 * 60 * 60 * 1000,
  lucky: (game) => game.persistent.coins >= 777,
};

function checkAndNotifyAchievements(game) {
  const { persistent } = game;
  // Temporarily attach capacity for garden_full check
  game._capacity = getFacilityValue('ram', persistent.facilities.ram);
  const newUnlocks = checkAchievements(persistent, game);
  delete game._capacity;

  for (const id of newUnlocks) {
    const now = new Date().toISOString().slice(0, 10);
    persistent.achievements[id] = { unlockedAt: now };
    const ach = getAchievement(id);
    if (ach) {
      game.actionLog.push(`Achievement: ${ach.icon} ${ach.name}`);
    }
  }
  if (newUnlocks.length > 0) {
    saveState(persistent);
  }
}

export function checkCondition(conditionId, game) {
  const checker = CONDITIONS[conditionId];
  return checker ? checker(game) : false;
}

export function processToolCall(game, toolName) {
  const { persistent } = game;

  // Track consecutive Bash calls for debugger condition
  if (toolName === 'Bash') {
    game.consecutiveBash++;
  } else {
    game.consecutiveBash = 0;
  }
  game.consecutiveFails = 0; // reset on success

  // Earn coins
  const coinsPerTool = getFacilityValue('gpu', persistent.facilities.gpu);
  persistent.coins += coinsPerTool;
  persistent.totalCoins += coinsPerTool;
  game.actionLog.push(`+${coinsPerTool} coin${coinsPerTool > 1 ? 's' : ''} (${toolName})`);

  // Try to spawn
  const capacity = getFacilityValue('ram', persistent.facilities.ram);
  if (game.garden.length < capacity && Math.random() < SPAWN_CHANCE) {
    // First spawn is always Normal rarity
    const isFirstSpawn = Object.keys(persistent.collection).length === 0 && persistent.stats.totalSpawned === 0;
    const spawned = isFirstSpawn ? rollFirstClaude() : rollClaude(persistent, game);
    if (spawned) {
      const isNew = !isDiscovered(persistent.collection, spawned.id);
      game.garden.push({ claude: spawned, isNew });
      persistent.stats.totalSpawned++;
      const stars = RARITY_STARS[spawned.rarity];
      const newTag = isNew ? ' [NEW!]' : '';
      game.actionLog.push(`${stars} ${spawned.name} Claude appeared!${newTag}`);
    }
  } else if (game.garden.length >= capacity && Math.random() < 0.25) {
    game.actionLog.push('Garden full! [Space] to collect.');
  }

  saveState(persistent);
  checkAndNotifyAchievements(game);
  return game;
}

export function processToolFail(game, toolName) {
  const { persistent } = game;
  game.consecutiveFails++;

  // 툴 실패 시 코인 차감
  const penalty = 2 + Math.floor(Math.random() * 4); // -2 ~ -5
  const lost = Math.min(penalty, persistent.coins); // 0 아래로는 안 감
  persistent.coins -= lost;

  if (lost > 0) {
    game.actionLog.push(`Tool failed! (${toolName}) -${lost}c`);
  } else {
    game.actionLog.push(`Tool failed! (${toolName})`);
  }

  saveState(persistent);
  checkAndNotifyAchievements(game);
  return game;
}

export function collectAll(game) {
  if (game.garden.length === 0) {
    game.actionLog.push('Garden is empty!');
    return game;
  }

  const { persistent } = game;
  let newCount = 0;
  let dupCoins = 0;
  const now = new Date().toISOString().slice(0, 10);

  for (const { claude } of game.garden) {
    if (!isDiscovered(persistent.collection, claude.id)) {
      // 최초 발견
      persistent.collection[claude.id] = { count: 1, firstSeen: now };
      newCount++;
    } else {
      // 중복 — 카운트 증가 + 보너스 코인
      persistent.collection[claude.id].count++;
      dupCoins += DUP_BONUS[claude.rarity];
    }
    persistent.stats.totalCollected++;
  }

  persistent.coins += dupCoins;
  persistent.totalCoins += dupCoins;

  const total = game.garden.length;
  game.garden = [];

  let msg = `Collected ${total}!`;
  if (newCount > 0) msg += ` (${newCount} NEW!)`;
  if (dupCoins > 0) msg += ` +${dupCoins} bonus`;
  game.actionLog.push(msg);

  saveState(persistent);
  checkAndNotifyAchievements(game);
  return game;
}

export function upgrade(game, facilityKey) {
  const { persistent } = game;
  if (!FACILITY_KEYS.includes(facilityKey)) return game;

  const currentLevel = persistent.facilities[facilityKey];
  const cost = getUpgradeCost(facilityKey, currentLevel);

  if (cost === null) {
    game.actionLog.push(`${FACILITIES[facilityKey].name} is already MAX!`);
    return game;
  }

  if (persistent.coins < cost) {
    game.actionLog.push(`Need ${cost} coins! (have ${persistent.coins})`);
    return game;
  }

  persistent.coins -= cost;
  persistent.facilities[facilityKey]++;

  const fac = FACILITIES[facilityKey];
  const newLv = persistent.facilities[facilityKey];
  const newVal = getFacilityValue(facilityKey, newLv);
  const valStr = facilityKey === 'cooling' ? `${newVal}x` : `${newVal}`;

  game.actionLog.push(`${fac.name} -> Lv.${newLv}! (${fac.desc}: ${valStr})`);

  saveState(persistent);
  checkAndNotifyAchievements(game);
  return game;
}

export function finishSession(game) {
  if (game.garden.length > 0) {
    game.actionLog.push('Session ending - auto-collecting...');
    collectAll(game);
  }
  saveState(game.persistent);
  return game;
}

const IDLE_SPAWN_CHANCE = 0.4;

export function idleSpawn(game) {
  const { persistent } = game;
  const capacity = getFacilityValue('ram', persistent.facilities.ram);
  if (game.garden.length >= capacity) return false;
  if (Math.random() >= IDLE_SPAWN_CHANCE) return false;

  const spawned = rollClaude(persistent, game);
  if (!spawned) return false;

  const isNew = !isDiscovered(persistent.collection, spawned.id);
  game.garden.push({ claude: spawned, isNew });
  persistent.stats.totalSpawned++;
  const stars = RARITY_STARS[spawned.rarity];
  const newTag = isNew ? ' [NEW!]' : '';
  game.actionLog.push(`${stars} ${spawned.name} Claude wandered in!${newTag}`);

  saveState(persistent);
  checkAndNotifyAchievements(game);
  return true;
}

export function gachaRoll(game, count) {
  const { persistent } = game;
  const gacha = persistent.gacha;
  const actualCount = count === 'max'
    ? Math.floor(persistent.coins / GACHA_COST)
    : count;

  if (actualCount <= 0) {
    game.actionLog.push(`Need ${GACHA_COST}c to roll! (have ${persistent.coins}c)`);
    return game;
  }

  const totalCost = actualCount * GACHA_COST;
  if (persistent.coins < totalCost) {
    game.actionLog.push(`Need ${totalCost}c! (have ${persistent.coins}c)`);
    return game;
  }

  persistent.coins -= totalCost;
  gacha.totalPulls += actualCount;

  const results = [];
  const now = new Date().toISOString().slice(0, 10);
  let newCount = 0;

  for (let i = 0; i < actualCount; i++) {
    gacha.pity.epic++;
    gacha.pity.legendary++;

    // Pity takes priority
    let forcedRarity = null;
    if (gacha.pity.legendary >= GACHA_PITY_LEGENDARY) {
      forcedRarity = 5;
      gacha.pity.legendary = 0;
      gacha.pity.epic = 0;
      gacha._hitPityLegendary = true;
    } else if (gacha.pity.epic >= GACHA_PITY_EPIC) {
      forcedRarity = 4;
      gacha.pity.epic = 0;
      gacha._hitPityEpic = true;
    }

    let chosenRarity;
    if (forcedRarity) {
      chosenRarity = forcedRarity;
    } else {
      let totalWeight = 0;
      for (const r in GACHA_WEIGHTS) totalWeight += GACHA_WEIGHTS[r];
      let roll = Math.random() * totalWeight;
      chosenRarity = 1;
      for (const r in GACHA_WEIGHTS) {
        roll -= GACHA_WEIGHTS[r];
        if (roll <= 0) { chosenRarity = Number(r); break; }
      }
      // Natural epic+ resets pity
      if (chosenRarity >= 4) gacha.pity.epic = 0;
      if (chosenRarity >= 5) gacha.pity.legendary = 0;
    }

    // Pick random claude of that rarity (no conditions, no secret)
    const candidates = ALL_CLAUDES.filter(c => c.rarity === chosenRarity && !c.secret);
    if (candidates.length === 0) continue;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];

    // Update collection (no dup coins — gacha is a sink)
    const isNew = !isDiscovered(persistent.collection, picked.id);
    if (isNew) {
      persistent.collection[picked.id] = { count: 1, firstSeen: now };
      newCount++;
    } else {
      persistent.collection[picked.id].count++;
    }
    persistent.stats.totalCollected++;

    results.push({ claude: picked, isNew });
  }

  // Store results for renderer
  game.gachaResults = { results, count: actualCount, cost: totalCost, newCount };

  saveState(persistent);
  checkAndNotifyAchievements(game);
  return game;
}

export function equipTitle(game, achievementId) {
  const { persistent } = game;
  const unlocked = persistent.achievements || {};
  const isUnlocked = Array.isArray(unlocked) ? unlocked.includes(achievementId) : (achievementId in unlocked);

  if (!isUnlocked) {
    game.actionLog.push('Not yet unlocked!');
    return game;
  }

  const ach = getAchievement(achievementId);
  if (!ach || !ach.title) {
    return game;
  }

  if (persistent.selectedTitle === achievementId) {
    // Toggle off
    persistent.selectedTitle = null;
    game.actionLog.push('Title removed.');
  } else {
    persistent.selectedTitle = achievementId;
    game.actionLog.push(`Title equipped: ${ach.title}`);
  }

  saveState(persistent);
  return game;
}

export function setNickname(game, name) {
  const { persistent } = game;
  const trimmed = name.trim().slice(0, 16);
  persistent.nickname = trimmed || null;
  game.actionLog.push(trimmed ? `Nickname set: ${trimmed}` : 'Nickname cleared.');
  saveState(persistent);
  return game;
}

export function setFavoriteClaude(game, claudeId) {
  const { persistent } = game;
  if (claudeId && !isDiscovered(persistent.collection, claudeId)) {
    game.actionLog.push('Not in collection!');
    return game;
  }
  persistent.favoriteClaude = claudeId || null;
  if (claudeId) {
    const cl = ALL_CLAUDES.find(c => c.id === claudeId);
    game.actionLog.push(`Favorite set: ${cl ? cl.name : claudeId}`);
  } else {
    game.actionLog.push('Favorite cleared.');
  }
  saveState(persistent);
  return game;
}

export { GACHA_COST };

function rollFirstClaude() {
  const normals = ALL_CLAUDES.filter(c => c.rarity === 1 && !c.condition && !c.secret);
  return normals[Math.floor(Math.random() * normals.length)];
}

function rollClaude(persistent, game) {
  const maxRarity = getFacilityValue('antenna', persistent.facilities.antenna);
  const coolingMult = getFacilityValue('cooling', persistent.facilities.cooling);

  // Build weighted pool
  let totalWeight = 0;
  const pool = [];

  for (let r = 1; r <= maxRarity; r++) {
    let weight = BASE_WEIGHTS[r];
    if (r >= 2) weight *= coolingMult;
    pool.push({ rarity: r, weight });
    totalWeight += weight;
  }

  // Roll rarity
  let roll = Math.random() * totalWeight;
  let chosenRarity = 1;
  for (const { rarity, weight } of pool) {
    roll -= weight;
    if (roll <= 0) { chosenRarity = rarity; break; }
  }

  // Build candidate pool: unconditional + conditionals whose condition is met
  const candidates = ALL_CLAUDES.filter(c => {
    if (c.rarity !== chosenRarity) return false;
    if (c.condition) return checkCondition(c.condition, game);
    return true;
  });
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
