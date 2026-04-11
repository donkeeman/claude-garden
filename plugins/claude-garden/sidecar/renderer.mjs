// Claude Garden — ANSI terminal renderer (mascot-based sprites)

import {
  ALL_CLAUDES, RARITY_NAMES, RARITY_STARS, RARITY_COLORS,
  getClaudeById, getClaudesByRarity,
} from './claudes.mjs';
import { FACILITIES, FACILITY_KEYS, getFacilityValue, getUpgradeCost } from './facilities.mjs';
import { getDiscoveredIds, isDiscovered } from './game.mjs';
import { ACHIEVEMENTS, CATEGORIES, getVisibleAchievements, getEquippedTitle } from './achievements.mjs';
import { generateCard } from './profile.mjs';
import { userInfo } from 'node:os';

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

// Terminal display width: CJK / fullwidth / special chars = 2 columns, others = 1
function visWidth(str) {
  const s = strip(str);
  let w = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    // CJK, Hangul, Fullwidth, and misc symbols rendered as 2-column in terminals
    if (
      (cp >= 0x1100 && cp <= 0x115F) ||   // Hangul Jamo
      (cp === 0x2661) ||                   // ♡ (renders 2-col on Windows Terminal)
      (cp >= 0x2E80 && cp <= 0x303E) ||   // CJK Radicals + misc
      (cp >= 0x3040 && cp <= 0x33BF) ||   // Hiragana, Katakana, CJK compat
      (cp >= 0x3400 && cp <= 0x4DBF) ||   // CJK Ext A
      (cp >= 0x4E00 && cp <= 0x9FFF) ||   // CJK Unified Ideographs
      (cp >= 0xAC00 && cp <= 0xD7AF) ||   // Hangul Syllables
      (cp >= 0xF900 && cp <= 0xFAFF) ||   // CJK Compat Ideographs
      (cp >= 0xFE30 && cp <= 0xFE6F) ||   // CJK Compat Forms
      (cp >= 0xFF01 && cp <= 0xFF60) ||   // Fullwidth Forms
      (cp >= 0xFFE0 && cp <= 0xFFE6) ||   // Fullwidth Signs
      (cp >= 0x20000 && cp <= 0x2FA1F)    // CJK Ext B-F + Compat Supplement
    ) {
      w += 2;
    } else {
      w += 1;
    }
  }
  return w;
}

function box(content, W) {
  const inner = W - 4;
  const visLen = visWidth(content);
  const pad = Math.max(0, inner - visLen);
  return `${C.orange}\u2551${C.reset} ${content}${' '.repeat(pad)} ${C.orange}\u2551${C.reset}`;
}

function emptyBox(W) { return box('', W); }

function centerIn(text, width) {
  const vis = visWidth(text);
  if (vis >= width) return text;
  const left = Math.floor((width - vis) / 2);
  return ' '.repeat(left) + text;
}

function padCenter(str, cellW) {
  const vis = visWidth(str);
  if (vis >= cellW) return str;
  const left = Math.floor((cellW - vis) / 2);
  const right = cellW - vis - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

function topB(W) { return `${C.orange}\u2554${'\u2550'.repeat(W - 2)}\u2557${C.reset}`; }
function midB(W) { return `${C.orange}\u2560${'\u2550'.repeat(W - 2)}\u2563${C.reset}`; }
function botB(W) { return `${C.orange}\u255A${'\u2550'.repeat(W - 2)}\u255D${C.reset}`; }

function trunc(text, max) {
  if (visWidth(text) <= max) return text;
  let w = 0;
  let i = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const cw = (
      (cp >= 0x1100 && cp <= 0x115F) ||
      (cp === 0x2661) ||
      (cp >= 0x2E80 && cp <= 0x303E) ||
      (cp >= 0x3040 && cp <= 0x33BF) ||
      (cp >= 0x3400 && cp <= 0x4DBF) ||
      (cp >= 0x4E00 && cp <= 0x9FFF) ||
      (cp >= 0xAC00 && cp <= 0xD7AF) ||
      (cp >= 0xF900 && cp <= 0xFAFF) ||
      (cp >= 0xFE30 && cp <= 0xFE6F) ||
      (cp >= 0xFF01 && cp <= 0xFF60) ||
      (cp >= 0xFFE0 && cp <= 0xFFE6) ||
      (cp >= 0x20000 && cp <= 0x2FA1F)
    ) ? 2 : 1;
    if (w + cw > max - 1) break;
    w += cw;
    i += ch.length;
  }
  return text.slice(0, i) + '\u2026';
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
  const streak = persistent.streak?.current || 0;
  const streakStr = streak > 0 ? `${C.red}${streak}d${C.reset} ` : '';
  const coinStr = `${streakStr}${C.yellow}${persistent.coins}c${C.reset}`;
  const equippedTitle = getEquippedTitle(persistent);
  const titleSuffix = equippedTitle ? ` ${C.cyan}[${equippedTitle}]${C.reset}` : '';
  const title = `${C.orange}${C.bold}Claude Garden${C.reset}${titleSuffix}`;
  const gap = Math.max(1, inner - visWidth(strip(title)) - visWidth(strip(coinStr)));
  lines.push(box(`${title}${' '.repeat(gap)}${coinStr}`, W));
  lines.push(midB(W));

  // Garden grid — each Claude = 3 lines (lid, face, name+tag)
  const cellW = 9;
  const perRow = Math.max(1, Math.floor(inner / cellW));

  if (garden.length === 0) {
    lines.push(emptyBox(W));
    lines.push(box(centerIn(`${C.dim}Garden is empty...${C.reset}`, inner), W));
    lines.push(box(centerIn(`${C.dim}Claudes appear as you work${C.reset}`, inner), W));
    lines.push(emptyBox(W));
  } else {
    lines.push(emptyBox(W));

    // Max 3 rows of mascots (3 lines each = 9 lines)
    const maxRows = 3;
    for (let rowStart = 0; rowStart < garden.length && rowStart / perRow < maxRows; rowStart += perRow) {
      const row = garden.slice(rowStart, rowStart + perRow);

      let lidLine = '';
      let faceLine = '';
      let nameLine = '';

      for (const { claude, isNew } of row) {
        const rc = RARITY_COLORS[claude.rarity] || C.white;
        lidLine  += padCenter(`${rc}${claude.mini[0]}${C.reset}`, cellW);
        faceLine += padCenter(`${rc}${C.bold}${claude.mini[1]}${C.reset}`, cellW);
        const shortName = claude.name.slice(0, 5);
        const tag = isNew ? `${C.yellow}${C.bold}NEW!${C.reset}` : `${C.dim}${shortName}${C.reset}`;
        nameLine += padCenter(tag, cellW);
      }

      lines.push(box(lidLine, W));
      lines.push(box(faceLine, W));
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
    if (log.startsWith('Achievement:'))
      colored = `${C.yellow}${C.bold}> ${t}${C.reset}`;
    else if (log.includes('appeared'))
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

    // Favorite indicator
    const isFav = persistent.favoriteClaude === cl.id;
    if (isFav) {
      lines.push(box(centerIn(`${C.red}\u2665${C.reset} ${C.bold}Favorite${C.reset}`, inner), W));
    }

    while (lines.length < 20) lines.push(emptyBox(W));

    lines.push(midB(W));
    const favHint = isFav ? '[F]Unfavorite' : '[F]Favorite';
    lines.push(box(`${C.dim}${favHint} [Esc/Tab] Back${C.reset}`, W));
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
      const hint = cursorCl.hint;
      if (hint) {
        lines.push(box(`${C.dim}\u25B6 ??? "${hint}"${C.reset}`, W));
      } else {
        lines.push(box(`${C.dim}\u25B6 ??? (undiscovered)${C.reset}`, W));
      }
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
// ACHIEVEMENTS VIEW
// ═══════════════════════════════════════════════════
function renderAchievements(game) {
  const W = getWidth();
  const inner = W - 4;
  const lines = [];
  const { persistent } = game;
  const unlocked = persistent.achievements || {};
  // Migration compat: if array, treat as object with no dates
  const isUnlocked = (id) => Array.isArray(unlocked) ? unlocked.includes(id) : (id in unlocked);
  const getDate = (id) => !Array.isArray(unlocked) && unlocked[id] ? unlocked[id].unlockedAt : null;
  const visible = getVisibleAchievements();
  const total = visible.length;
  const doneCount = visible.filter(a => isUnlocked(a.id)).length;

  lines.push(topB(W));
  lines.push(box(centerIn(`${C.orange}${C.bold}Achievements${C.reset}  ${C.dim}${doneCount}/${total}${C.reset}`, inner), W));
  lines.push(midB(W));

  // Build flat list of achievements (for cursor indexing)
  const flatList = [];
  const catOrder = Object.keys(CATEGORIES);
  for (const catId of catOrder) {
    const achs = visible.filter(a => a.category === catId);
    if (achs.length === 0) continue;
    flatList.push(...achs);
  }

  // Build display rows grouped by category
  const displayRows = [];
  for (const catId of catOrder) {
    const cat = CATEGORIES[catId];
    const achs = visible.filter(a => a.category === catId);
    if (achs.length === 0) continue;

    const catDone = achs.filter(a => isUnlocked(a.id)).length;
    displayRows.push({ type: 'header', text: `${cat.name} (${catDone}/${achs.length})` });
    for (const ach of achs) {
      const done = isUnlocked(ach.id);
      const flatIdx = flatList.indexOf(ach);
      const isCursor = flatIdx === (game.achievementCursor || 0);
      displayRows.push({ type: 'achievement', ach, done, isCursor });
    }
  }

  // Scrolling — auto-scroll to keep cursor visible
  const maxVisible = 11;
  let scroll = game.achievementScroll || 0;

  // Find cursor row index in displayRows
  const cursorRowIdx = displayRows.findIndex(r => r.type === 'achievement' && r.isCursor);
  if (cursorRowIdx >= 0) {
    if (cursorRowIdx < scroll) scroll = cursorRowIdx;
    if (cursorRowIdx >= scroll + maxVisible) scroll = cursorRowIdx - maxVisible + 1;
    game.achievementScroll = scroll;
  }

  const visibleRows = displayRows.slice(scroll, scroll + maxVisible);

  if (scroll > 0) {
    lines.push(box(`${C.dim}  ▲ more above${C.reset}`, W));
  } else {
    lines.push(emptyBox(W));
  }

  const equipped = persistent.selectedTitle;
  for (const row of visibleRows) {
    if (row.type === 'header') {
      lines.push(box(`${C.cyan}${C.bold}── ${row.text} ──${C.reset}`, W));
    } else {
      const { ach, done, isCursor } = row;
      const sel = isCursor ? '\x1b[7m' : '';
      const selEnd = isCursor ? C.reset : '';
      const isEquipped = ach.title && equipped === ach.id;
      const titleMark = isEquipped ? `${C.cyan} <${C.reset}` : (ach.title && done ? `${C.dim} ~${C.reset}` : '');
      if (done) {
        lines.push(box(`${sel}  ${C.green}${C.bold}${ach.icon}${C.reset}${sel} ${C.bold}${ach.name}${C.reset}${selEnd}${titleMark}`, W));
      } else {
        lines.push(box(`${sel}  ${C.dim}${ach.icon} ${ach.name}${C.reset}${selEnd}`, W));
      }
    }
  }

  if (scroll + maxVisible < displayRows.length) {
    lines.push(box(`${C.dim}  ▼ more below${C.reset}`, W));
  } else {
    lines.push(emptyBox(W));
  }

  // Detail panel for selected achievement
  lines.push(midB(W));
  const cursorAch = flatList[game.achievementCursor || 0];
  if (cursorAch) {
    const done = isUnlocked(cursorAch.id);
    if (done) {
      lines.push(box(`${C.bold}${cursorAch.name}${C.reset} ${C.green}${C.bold}DONE${C.reset}`, W));
      lines.push(box(`${C.dim}${cursorAch.desc}${C.reset}`, W));
      const date = getDate(cursorAch.id);
      if (date) {
        lines.push(box(`${C.dim}Unlocked: ${C.reset}${C.bold}${date}${C.reset}`, W));
      }
      if (cursorAch.title) {
        const isEquipped = equipped === cursorAch.id;
        if (isEquipped) {
          lines.push(box(`${C.cyan}${C.bold}Title: [${cursorAch.title}]${C.reset} ${C.dim}(Enter to unequip)${C.reset}`, W));
        } else {
          lines.push(box(`${C.dim}Title: ${cursorAch.title}${C.reset} ${C.dim}(Enter to equip)${C.reset}`, W));
        }
      }
    } else {
      lines.push(box(`${C.dim}${cursorAch.name}${C.reset}`, W));
      lines.push(box(`${C.yellow}${C.dim}Hint: ${cursorAch.hint}${C.reset}`, W));
      if (cursorAch.title) {
        lines.push(box(`${C.dim}Grants title: ${cursorAch.title}${C.reset}`, W));
      } else {
        lines.push(emptyBox(W));
      }
    }
  }

  while (lines.length < 22) lines.push(emptyBox(W));

  lines.push(midB(W));
  const ctrlHint = flatList.some(a => a.title) ? '[Enter] Equip title ' : '';
  lines.push(box(`${C.dim}[↑↓] Select ${ctrlHint}[Esc] Back [Tab] Next${C.reset}`, W));
  lines.push(botB(W));

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════
// GACHA VIEW
// ═══════════════════════════════════════════════════
function renderGacha(game) {
  const W = getWidth();
  const inner = W - 4;
  const lines = [];
  const { persistent } = game;
  const gacha = persistent.gacha || { pity: { epic: 0, legendary: 0 }, totalPulls: 0 };
  const COST = 200;

  lines.push(topB(W));
  lines.push(box(`${C.orange}${C.bold}Gacha${C.reset}    ${C.yellow}Coins: ${persistent.coins}c${C.reset}`, W));
  lines.push(midB(W));
  lines.push(emptyBox(W));

  // Roll options
  const can1 = persistent.coins >= COST;
  const can10 = persistent.coins >= COST * 10;
  const maxRolls = Math.floor(persistent.coins / COST);

  const c1 = can1 ? C.green : C.red;
  const c10 = can10 ? C.green : C.red;
  const cM = maxRolls > 0 ? C.green : C.red;

  lines.push(box(`  ${C.bold}[1]${C.reset} 1x Roll .......... ${c1}${COST}c${C.reset}`, W));
  lines.push(box(`  ${C.bold}[0]${C.reset} 10x Roll ......... ${c10}${COST * 10}c${C.reset}`, W));
  lines.push(box(`  ${C.bold}[M]${C.reset} Max Roll (${maxRolls}x) ${'.'.repeat(Math.max(1, 8 - String(maxRolls).length))} ${cM}${maxRolls * COST}c${C.reset}`, W));
  lines.push(emptyBox(W));

  // Pity counters
  lines.push(box(`${C.dim}Pity: ${gacha.pity.epic}/30 Epic  ${gacha.pity.legendary}/80 Legendary${C.reset}`, W));
  lines.push(box(`${C.dim}Total pulls: ${gacha.totalPulls}${C.reset}`, W));
  lines.push(emptyBox(W));

  // Results display
  const gr = game.gachaResults;
  if (gr && gr.results.length > 0) {
    lines.push(midB(W));
    if (gr.count <= 10) {
      // Individual list
      lines.push(box(`${C.bold}Result (${gr.count}x) — ${gr.cost}c spent${C.reset}`, W));
      for (const { claude, isNew } of gr.results) {
        const rc = RARITY_COLORS[claude.rarity];
        const stars = RARITY_STARS[claude.rarity];
        const tag = isNew ? ` ${C.yellow}${C.bold}[NEW!]${C.reset}` : '';
        lines.push(box(`  ${rc}${stars}${C.reset} ${rc}${claude.name}${C.reset}${tag}`, W));
      }
    } else {
      // Summary for max rolls
      lines.push(box(`${C.bold}Max Roll (${gr.count}x) — ${gr.cost}c spent${C.reset}`, W));

      const byCounts = {};
      for (const { claude } of gr.results) {
        byCounts[claude.rarity] = (byCounts[claude.rarity] || 0) + 1;
      }
      for (let r = 1; r <= 5; r++) {
        if (!byCounts[r]) continue;
        const rc = RARITY_COLORS[r];
        const stars = RARITY_STARS[r];
        const name = RARITY_NAMES[r];
        lines.push(box(`  ${rc}${stars} ${name}${C.reset}  x${byCounts[r]}`, W));
      }

      // NEW discoveries
      const newOnes = gr.results.filter(r => r.isNew);
      if (newOnes.length > 0) {
        const names = newOnes.map(r => r.claude.name).join(', ');
        lines.push(box(`${C.yellow}${C.bold}NEW: ${names}${C.reset}`, W));
      }
    }
  }

  while (lines.length < 20) lines.push(emptyBox(W));

  lines.push(midB(W));
  lines.push(box(`${C.dim}[1]1x [0]10x [M]Max [Esc]Back [Tab]Next${C.reset}`, W));
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

  // Big mascot for splash (Unicode block chars, 7 chars wide)
  const mascot = [
    `${C.orange}  \u259B\u2588\u2588\u2588\u259C  ${C.reset}`,
    `${C.orange}  \u2588   \u2588  ${C.reset}`,
    `${C.orange}  \u2588\u00B7 \u00B7\u2588  ${C.reset}`,
    `${C.orange}  \u2588   \u2588  ${C.reset}`,
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
// PROFILE VIEW — nickname, favorite, stats
// ═══════════════════════════════════════════════════
function renderProfile(game) {
  const W = getWidth();
  const inner = W - 4;
  const lines = [];
  const { persistent } = game;
  const mode = game.profileMode || 'view';

  // ─── Edit Nickname mode ───
  if (mode === 'editNickname') {
    lines.push(topB(W));
    lines.push(box(centerIn(`${C.orange}${C.bold}Set Nickname${C.reset}`, inner), W));
    lines.push(midB(W));
    lines.push(emptyBox(W));
    lines.push(emptyBox(W));

    const draft = game.nicknameDraft || '';
    lines.push(box(centerIn(`${C.bold}${draft}_${C.reset}`, inner), W));
    lines.push(emptyBox(W));
    lines.push(box(centerIn(`${C.dim}Max 16 characters${C.reset}`, inner), W));

    while (lines.length < 20) lines.push(emptyBox(W));

    lines.push(midB(W));
    lines.push(box(`${C.dim}[Enter] Confirm  [Esc] Cancel${C.reset}`, W));
    lines.push(botB(W));
    return lines.join('\n');
  }

  // ─── View mode (default) ───
  if (!persistent.favoriteClaude) {
    // No favorite — show prompt to set one
    lines.push(topB(W));
    lines.push(box(centerIn(`${C.orange}${C.bold}Profile${C.reset}`, inner), W));
    lines.push(midB(W));
    lines.push(emptyBox(W));
    lines.push(emptyBox(W));
    lines.push(box(centerIn(`${C.dim}No favorite Claude set${C.reset}`, inner), W));
    lines.push(emptyBox(W));
    lines.push(box(centerIn(`${C.dim}Go to Collection > select a Claude${C.reset}`, inner), W));
    lines.push(box(centerIn(`${C.dim}and press [F] to set as favorite${C.reset}`, inner), W));
    lines.push(emptyBox(W));

    while (lines.length < 20) lines.push(emptyBox(W));

    lines.push(midB(W));
    lines.push(box(`${C.dim}[N]Name [Tab]Next${C.reset}`, W));
    lines.push(botB(W));
  } else {
    // Card preview — show the actual card that will be copied
    const card = generateCard(persistent);
    const cardLines = card.split('\n');

    // Center card lines in terminal
    for (const cl of cardLines) {
      const pad = Math.max(0, Math.floor((W - visWidth(cl)) / 2));
      lines.push(' '.repeat(pad) + cl);
    }

    lines.push('');

    // Copy feedback
    const lastLog = (game.actionLog || []).slice(-1)[0] || '';
    if (lastLog.toLowerCase().includes('clipboard')) {
      const pad = Math.max(0, Math.floor((W - visWidth(lastLog) - 2) / 2));
      lines.push(`${' '.repeat(pad)}${C.green}${lastLog}${C.reset}`);
    }

    // Controls — plain text below card
    const ctrl = `${C.dim}[N]Name [C]Copy card [Tab]Next${C.reset}`;
    const ctrlPad = Math.max(0, Math.floor((W - 30) / 2));
    lines.push(`${' '.repeat(ctrlPad)}${ctrl}`);
  }

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
    case 'gacha': return renderGacha(game);
    case 'achievements': return renderAchievements(game);
    case 'profile': return renderProfile(game);
    default: return renderGarden(game);
  }
}
