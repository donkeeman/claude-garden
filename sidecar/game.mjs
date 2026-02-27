// Claude Garden — Game state machine

import { ALL_CLAUDES, RARITY_STARS, DUP_BONUS } from './claudes.mjs';
import { FACILITIES, FACILITY_KEYS, getFacilityValue, getUpgradeCost } from './facilities.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATE_PATH = join(import.meta.dirname, '..', 'state.json');

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
  return state;
}

function createDefaultState() {
  return {
    coins: 0,
    totalCoins: 0,
    facilities: { gpu: 1, ram: 1, cooling: 1, antenna: 1 },
    collection: {},  // { [claudeId]: { count: number, firstSeen: 'YYYY-MM-DD' } }
    stats: { totalCollected: 0, totalSpawned: 0, sessionsPlayed: 0 },
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

  return {
    sessionId,
    persistent,
    garden: [],          // { claude, isNew } — Claudes currently in garden
    actionLog: [],       // recent action messages
    screen: 'garden',    // 'garden' | 'collection' | 'upgrades'
    detailClaude: null,  // for collection detail view
    cursor: 0,           // 컬렉션 리스트 커서 위치
  };
}

export function processToolCall(game, toolName) {
  const { persistent } = game;

  // Earn coins
  const coinsPerTool = getFacilityValue('gpu', persistent.facilities.gpu);
  persistent.coins += coinsPerTool;
  persistent.totalCoins += coinsPerTool;
  game.actionLog.push(`+${coinsPerTool} coin${coinsPerTool > 1 ? 's' : ''} (${toolName})`);

  // Try to spawn
  const capacity = getFacilityValue('ram', persistent.facilities.ram);
  if (game.garden.length < capacity && Math.random() < SPAWN_CHANCE) {
    const spawned = rollClaude(persistent);
    if (spawned) {
      game.garden.push({ claude: spawned, isNew: true });
      persistent.stats.totalSpawned++;
      const stars = RARITY_STARS[spawned.rarity];
      const isNew = !isDiscovered(persistent.collection, spawned.id);
      const newTag = isNew ? ' [NEW!]' : '';
      game.actionLog.push(`${stars} ${spawned.name} Claude appeared!${newTag}`);
    }
  } else if (game.garden.length >= capacity && Math.random() < 0.25) {
    game.actionLog.push('Garden full! [Space] to collect.');
  }

  saveState(persistent);
  return game;
}

export function processToolFail(game, toolName) {
  const { persistent } = game;

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

function rollClaude(persistent) {
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

  // Pick random Claude of that rarity
  const candidates = ALL_CLAUDES.filter(c => c.rarity === chosenRarity);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
