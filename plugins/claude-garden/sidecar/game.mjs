// Claude Garden — Game state machine

import { ALL_CLAUDES, RARITY_STARS, DUP_BONUS } from './claudes.mjs';
import { FACILITIES, FACILITY_KEYS, getFacilityValue, getUpgradeCost } from './facilities.mjs';
import { checkAchievements, getAchievement } from './achievements.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, '..', 'state.json');

// Rarity spawn weights (before cooling multiplier)
const BASE_WEIGHTS = { 1: 100, 2: 20, 3: 5, 4: 1, 5: 0.1 };
const SPAWN_CHANCE = 0.55; // 55% per tool call

function loadState() {
  if (existsSync(STATE_PATH)) {
    try {
      const state = JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
      return migrateState(state);
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
  return state;
}

function createDefaultState() {
  return {
    coins: 0,
    totalCoins: 0,
    facilities: { gpu: 1, ram: 1, cooling: 1, antenna: 1 },
    collection: {},  // { [claudeId]: { count: number, firstSeen: 'YYYY-MM-DD' } }
    stats: { totalCollected: 0, totalSpawned: 0, sessionsPlayed: 0 },
    achievements: [],
  };
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

// 발견된 클로드 ID 목록 (순서 유지)
export function getDiscoveredIds(collection) {
  return Object.keys(collection);
}

// 특정 클로드가 발견되었는지
export function isDiscovered(collection, id) {
  return id in collection;
}

export function createGame(sessionId) {
  const persistent = loadState();
  persistent.stats.sessionsPlayed++;
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
    sessionStart: Date.now(),
    consecutiveBash: 0,  // consecutive Bash tool calls
    consecutiveFails: 0, // consecutive tool failures
  };

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
    persistent.achievements.push(id);
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
    const spawned = rollClaude(persistent, game);
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
