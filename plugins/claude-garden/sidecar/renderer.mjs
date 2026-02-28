// Claude Garden — ANSI terminal renderer (mascot-based sprites)

import {
  ALL_CLAUDES, RARITY_NAMES, RARITY_STARS, RARITY_COLORS,
  getClaudeById, getClaudesByRarity,
} from './claudes.mjs';
import { FACILITIES, FACILITY_KEYS, getFacilityValue, getUpgradeCost } from './facilities.mjs';
import { getDiscoveredIds, isDiscovered } from './game.mjs';

// ANSI escape codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  orange: '\x1b[38;5;208m',
  orangeBright: '\x1b[38;5;214m',
  orangeDim: '\x1b[38;5;172m',
};

function getWidth() {
  return Math.max(36, Math.min(80, process.stdout.columns || 50));
}

function strip(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function box(content, W) {
  const inner = W - 4;
  const visLen = strip(content).length;
  const pad = Math.max(0, inner - visLen);
  return `${C.orange}\u2551${C.reset} ${content}${' '.repeat(pad)} ${C.orange}\u2551${C.reset}`;
}

function emptyBox(W) { return box('', W); }

function centerIn(text, width) {
  const vis = strip(text).length;
  if (vis >= width) return text;
  const left = Math.floor((width - vis) / 2);
  return ' '.repeat(left) + text;
}

function padCenter(str, cellW) {
  const vis = strip(str).length;
  if (vis >= cellW) return str;
  const left = Math.floor((cellW - vis) / 2);
  const right = cellW - vis - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

function topB(W) { return `${C.orange}\u2554${'\u2550'.repeat(W - 2)}\u2557${C.reset}`; }
function midB(W) { return `${C.orange}\u2560${'\u2550'.repeat(W - 2)}\u2563${C.reset}`; }
function botB(W) { return `${C.orange}\u255A${'\u2550'.repeat(W - 2)}\u255D${C.reset}`; }

function trunc(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '\u2026';
}

// ═══════════════════════════════════════════════════
// GARDEN VIEW (main screen) — mascot mini sprites
// ═══════════════════════════════════════════════════
function renderGarden(game) {
  const W = getWidth();
  const inner = W - 4;
  const lines = [];
  const { persistent, garden } = game;
  const capacity = getFacilityValue('ram', persistent.facilities.ram);

  // Title bar
  lines.push(topB(W));
  const coinStr = `${C.yellow}${persistent.coins}c${C.reset}`;
  const title = `${C.orange}${C.bold}Claude Garden${C.reset}`;
  const gap = Math.max(1, inner - strip(title).length - strip(coinStr).length);
  lines.push(box(`${title}${' '.repeat(gap)}${coinStr}`, W));
  lines.push(midB(W));

  // Garden grid — each Claude = 4 lines (ears, body, legs, name+tag)
  const cellW = 9;
  const perRow = Math.max(1, Math.floor(inner / cellW));

  if (garden.length === 0) {
    lines.push(emptyBox(W));
    lines.push(box(centerIn(`${C.dim}Garden is empty...${C.reset}`, inner), W));
    lines.push(box(centerIn(`${C.dim}Claudes appear as you work${C.reset}`, inner), W));
    lines.push(emptyBox(W));
  } else {
    lines.push(emptyBox(W));

    // Max 2 rows of mascots (4 lines each = 8 lines)
    const maxRows = 2;
    for (let rowStart = 0; rowStart < garden.length && rowStart / perRow < maxRows; rowStart += perRow) {
      const row = garden.slice(rowStart, rowStart + perRow);

      let earLine = '';
      let bodyLine = '';
      let legLine = '';
      let nameLine = '';

      for (const { claude, isNew } of row) {
        const rc = RARITY_COLORS[claude.rarity] || C.white;
        earLine  += padCenter(`${rc}${claude.mini[0]}${C.reset}`, cellW);
        bodyLine += padCenter(`${rc}${C.bold}${claude.mini[1]}${C.reset}`, cellW);
        legLine  += padCenter(`${rc}${claude.mini[2]}${C.reset}`, cellW);
        const shortName = claude.name.slice(0, 5);
        // 처음 등장한 클로드에 NEW! 표시
        const tag = isNew ? `${C.yellow}${C.bold}NEW!${C.reset}` : `${C.dim}${shortName}${C.reset}`;
        nameLine += padCenter(tag, cellW);
      }

      lines.push(box(earLine, W));
      lines.push(box(bodyLine, W));
      lines.push(box(legLine, W));
      lines.push(box(nameLine, W));
    }

    // Overflow indicator
    const shown = Math.min(garden.length, perRow * maxRows);
    if (garden.length > shown) {
      lines.push(box(`${C.dim}  ...and ${garden.length - shown} more${C.reset}`, W));
    }

    lines.push(box(`${C.dim}Garden: ${garden.length}/${capacity}${C.reset}`, W));
  }

  // Action log
  lines.push(midB(W));
  const logSlots = Math.max(3, Math.min(6, 22 - lines.length));
  const recentLogs = game.actionLog.slice(-logSlots);

  for (const log of recentLogs) {
    const t = trunc(log, inner - 2);
    let colored;
    if (log.includes('appeared'))
      colored = `${C.green}${C.bold}> ${t}${C.reset}`;
    else if (log.includes('NEW'))
      colored = `${C.yellow}${C.bold}> ${t}${C.reset}`;
    else if (log.includes('Collected'))
      colored = `${C.magenta}> ${t}${C.reset}`;
    else if (log.includes('upgraded') || log.includes('->'))
      colored = `${C.cyan}${C.bold}> ${t}${C.reset}`;
    else if (log.includes('failed') || log.includes('Need'))
      colored = `${C.red}> ${t}${C.reset}`;
    else if (log.includes('coin'))
      colored = `${C.yellow}> ${t}${C.reset}`;
    else
      colored = `${C.dim}> ${t}${C.reset}`;

    lines.push(box(colored, W));
  }
  for (let i = recentLogs.length; i < logSlots; i++) {
    lines.push(emptyBox(W));
  }

  // Controls
  lines.push(midB(W));
  lines.push(box(`${C.dim}[Space]Collect [Tab]View [1-4]Upgrade${C.reset}`, W));
  lines.push(botB(W));

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════
// COLLECTION VIEW — mascot list + detail
// ═══════════════════════════════════════════════════
function renderCollection(game) {
  const W = getWidth();
  const inner = W - 4;
  const lines = [];
  const { persistent, detailClaude } = game;
  const collection = persistent.collection;
  const discoveredIds = getDiscoveredIds(collection);
  const total = ALL_CLAUDES.length;

  lines.push(topB(W));
  lines.push(box(centerIn(`${C.orange}${C.bold}Collection${C.reset} ${C.dim}${discoveredIds.length}/${total}${C.reset}`, inner), W));
  lines.push(midB(W));

  // ─── Detail view ───
  if (detailClaude) {
    const cl = detailClaude;
    const rc = RARITY_COLORS[cl.rarity];
    const stars = RARITY_STARS[cl.rarity];

    lines.push(emptyBox(W));

    // Full 7-line mascot sprite
    for (const spLine of cl.sprite) {
      lines.push(box(centerIn(`${rc}${C.bold}${spLine}${C.reset}`, inner), W));
    }

    lines.push(emptyBox(W));
    // 디테일에서는 풀네임 표시
    lines.push(box(centerIn(`${rc}${C.bold}${cl.name} Claude${C.reset}`, inner), W));
    lines.push(box(centerIn(`${rc}${stars} ${RARITY_NAMES[cl.rarity]}${C.reset}`, inner), W));
    lines.push(emptyBox(W));
    lines.push(box(centerIn(`${C.dim}"${cl.desc}"${C.reset}`, inner), W));
    lines.push(emptyBox(W));

    // 수집 통계 (횟수 + 최초 획득일)
    const info = collection[cl.id];
    if (info) {
      lines.push(box(centerIn(
        `${C.dim}Collected: ${C.reset}${C.bold}${info.count}${C.reset}${C.dim}x  |  First: ${C.reset}${C.bold}${info.firstSeen}${C.reset}`,
        inner,
      ), W));
    }

    while (lines.length < 20) lines.push(emptyBox(W));

    lines.push(midB(W));
    lines.push(box(`${C.dim}[Esc/Tab] Back to list${C.reset}`, W));
    lines.push(botB(W));
    return lines.join('\n');
  }

  // ─── List view — 모든 클로드를 레리티별 그리드로 표시 ───
  // cursor는 ALL_CLAUDES 인덱스 기반
  const cursor = game.cursor || 0;
  const cursorCl = ALL_CLAUDES[Math.min(cursor, ALL_CLAUDES.length - 1)];

  for (let r = 1; r <= 5; r++) {
    const claudesOfR = getClaudesByRarity(r);
    const foundOfR = claudesOfR.filter(c => isDiscovered(collection, c.id));
    const rc = RARITY_COLORS[r];

    lines.push(box(
      `${rc}${C.bold}${RARITY_STARS[r]} ${RARITY_NAMES[r]}${C.reset} ${C.dim}(${foundOfR.length}/${claudesOfR.length})${C.reset}`,
      W,
    ));

    // 발견된 것과 미발견 모두 표시
    let row = '';
    let rowVis = 0;
    for (const cl of claudesOfR) {
      const found = isDiscovered(collection, cl.id);
      const globalIdx = ALL_CLAUDES.indexOf(cl);
      const isCursor = globalIdx === cursor;

      let cell;
      if (!found) {
        // 미발견이지만 커서 위치일 수 있음
        if (isCursor) {
          cell = `\x1b[7m${C.dim}\u2590???\u258C${C.reset} `;
        } else {
          cell = `${C.dim}\u2590???\u258C${C.reset} `;
        }
      } else if (isCursor) {
        cell = `\x1b[7m${rc}${C.bold}${cl.mini[1]}${C.reset} `;
      } else {
        cell = `${rc}${cl.mini[1]}${C.reset} `;
      }
      const cellVis = 6;

      if (rowVis + cellVis > inner) {
        lines.push(box(row, W));
        row = '';
        rowVis = 0;
      }
      row += cell;
      rowVis += cellVis;
    }
    if (rowVis > 0) lines.push(box(row, W));
  }

  // 현재 선택된 클로드 미리보기
  if (cursorCl) {
    const found = isDiscovered(collection, cursorCl.id);
    if (found) {
      const selRc = RARITY_COLORS[cursorCl.rarity];
      const info = collection[cursorCl.id];
      const countStr = info ? ` x${info.count}` : '';
      lines.push(box(
        `${C.dim}\u25B6${C.reset} ${selRc}${C.bold}${cursorCl.name}${C.reset}${C.dim}${countStr} ${cursorCl.desc}${C.reset}`,
        W,
      ));
    } else {
      lines.push(box(`${C.dim}\u25B6 ??? (undiscovered)${C.reset}`, W));
    }
  }

  while (lines.length < 20) lines.push(emptyBox(W));

  lines.push(midB(W));
  lines.push(box(`${C.dim}[\u2190\u2191\u2192\u2193] Move [\u21B5] Detail [Esc] Back [Tab] Next${C.reset}`, W));
  lines.push(botB(W));

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════
// UPGRADES VIEW
// ═══════════════════════════════════════════════════
function renderUpgrades(game) {
  const W = getWidth();
  const inner = W - 4;
  const lines = [];
  const { persistent } = game;

  lines.push(topB(W));
  lines.push(box(`${C.orange}${C.bold}Facilities${C.reset}    ${C.yellow}Coins: ${persistent.coins}${C.reset}`, W));
  lines.push(midB(W));
  lines.push(emptyBox(W));

  for (let i = 0; i < FACILITY_KEYS.length; i++) {
    const key = FACILITY_KEYS[i];
    const fac = FACILITIES[key];
    const lv = persistent.facilities[key];
    const val = getFacilityValue(key, lv);
    const cost = getUpgradeCost(key, lv);
    const valStr = key === 'cooling' ? `${val}x` : `${val}`;

    if (cost === null) {
      lines.push(box(`  ${C.bold}[${i + 1}]${C.reset} ${fac.name} ${C.green}${C.bold}Lv.${lv} MAX${C.reset}`, W));
      lines.push(box(`      ${C.dim}${fac.desc}: ${valStr}${C.reset}`, W));
    } else {
      const nextVal = getFacilityValue(key, lv + 1);
      const nextStr = key === 'cooling' ? `${nextVal}x` : `${nextVal}`;
      const afford = persistent.coins >= cost;
      const cc = afford ? C.green : C.red;
      lines.push(box(
        `  ${C.bold}[${i + 1}]${C.reset} ${fac.name} Lv.${lv} -> Lv.${lv + 1}  ${cc}${cost}c${C.reset}`,
        W,
      ));
      lines.push(box(`      ${C.dim}${fac.desc}: ${valStr} -> ${nextStr}${C.reset}`, W));
    }
    lines.push(emptyBox(W));
  }

  while (lines.length < 20) lines.push(emptyBox(W));

  lines.push(midB(W));
  lines.push(box(`${C.dim}[1-4] Upgrade [Esc] Back [Tab] Next [Space] Collect${C.reset}`, W));
  lines.push(botB(W));

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════
// SPLASH SCREEN — official mascot
// ═══════════════════════════════════════════════════
export function renderSplash() {
  const W = getWidth();
  const inner = W - 4;
  const lines = [];

  // Big mascot for splash (Unicode block chars, 9 chars wide)
  const mascot = [
    `${C.orange}   \u2590 \u258C   ${C.reset}`,
    `${C.orange}  \u259B\u2588\u2588\u2588\u259C  ${C.reset}`,
    `${C.orange} \u2590\u2588   \u2588\u258C ${C.reset}`,
    `${C.orange} \u2590\u2588\u00B7 \u00B7\u2588\u258C ${C.reset}`,
    `${C.orange} \u2590\u2588   \u2588\u258C ${C.reset}`,
    `${C.orange}  \u2599\u2588 \u2588\u259F  ${C.reset}`,
    `${C.orange}   \u2598 \u259D   ${C.reset}`,
  ];

  lines.push(topB(W));
  lines.push(emptyBox(W));
  if (W >= 44) {
    for (const line of mascot) lines.push(box(centerIn(line, inner), W));
    lines.push(emptyBox(W));
  }
  lines.push(box(centerIn(`${C.bold}${C.orange}Claude Garden${C.reset}`, inner), W));
  lines.push(box(centerIn(`${C.dim}Claude Code Edition${C.reset}`, inner), W));
  lines.push(emptyBox(W));
  lines.push(box(centerIn(`${C.dim}Waiting for session...${C.reset}`, inner), W));
  lines.push(box(centerIn(`${C.dim}Auto-connects on Claude start${C.reset}`, inner), W));
  lines.push(emptyBox(W));
  lines.push(botB(W));

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════
// MAIN RENDER DISPATCHER
// ═══════════════════════════════════════════════════
export function render(game) {
  if (!game) return '';
  switch (game.screen) {
    case 'collection': return renderCollection(game);
    case 'upgrades': return renderUpgrades(game);
    default: return renderGarden(game);
  }
}
