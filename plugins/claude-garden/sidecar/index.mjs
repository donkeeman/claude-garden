#!/usr/bin/env node

// Claude Garden Sidecar — JSONL watcher + keyboard + game loop

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createGame, processToolCall, processToolFail, collectAll, upgrade, finishSession, getDiscoveredIds, isDiscovered } from './game.mjs';
import { render, renderSplash } from './renderer.mjs';
import { ALL_CLAUDES } from './claudes.mjs';
import { FACILITY_KEYS } from './facilities.mjs';

const EVENT_DIR = join(homedir(), '.claude', 'claude-garden');
const EVENT_FILE = join(EVENT_DIR, 'events.jsonl');
const PID_FILE = join(EVENT_DIR, 'sidecar.pid');

if (!existsSync(EVENT_DIR)) mkdirSync(EVENT_DIR, { recursive: true });
writeFileSync(PID_FILE, String(process.pid));

const SCREENS = ['garden', 'collection', 'upgrades'];
let game = null;
let lastLineCount = 0;
let lastRender = '';

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

function renderFrame() {
  const output = render(game);
  if (output !== lastRender) {
    clearScreen();
    process.stdout.write(output + '\n');
    lastRender = output;
  }
}

function processNewLines() {
  if (!existsSync(EVENT_FILE)) return;

  let content;
  try { content = readFileSync(EVENT_FILE, 'utf-8'); } catch { return; }

  const lines = content.trim().split('\n').filter(Boolean);

  // JSONL cleared (new session)
  if (lines.length < lastLineCount) {
    lastLineCount = 0;
    game = null;
    lastRender = '';
  }

  if (lines.length <= lastLineCount) return;

  const newLines = lines.slice(lastLineCount);
  lastLineCount = lines.length;

  for (const line of newLines) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }

    if (event.type === 'session_start') {
      game = createGame(event.session);
      game.actionLog.push("Session started! Let's grow some Claudes!");
    }

    if (!game) game = createGame(event.session || 'unknown');

    if (event.type === 'post_tool') {
      game = processToolCall(game, event.tool || 'unknown');
    } else if (event.type === 'post_tool_fail') {
      game = processToolFail(game, event.tool || 'unknown');
    } else if (event.type === 'stop') {
      game = finishSession(game);
    }

    renderFrame();
  }
}

// ─── Keyboard input ───
function setupKeyboard() {
  if (!process.stdin.isTTY) return;

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', (key) => {
    // Ctrl+C → quit
    if (key === '\x03') {
      cleanup();
      clearScreen();
      const O = '\x1b[38;5;208m';
      const D = '\x1b[2m';
      const R = '\x1b[0m';
      console.log(`${O}Claude Garden sidecar stopped!${R}`);
      if (game) {
        const p = game.persistent;
        console.log(`${D}Collection: ${getDiscoveredIds(p.collection).length}/${ALL_CLAUDES.length} | Coins earned: ${p.totalCoins} | Sessions: ${p.stats.sessionsPlayed}${R}`);
      }
      process.exit(0);
    }

    if (!game) return;

    // Space → collect
    if (key === ' ') {
      game = collectAll(game);
      lastRender = '';
      renderFrame();
      return;
    }

    // Tab → switch screen
    if (key === '\t') {
      game.detailClaude = null;
      const idx = SCREENS.indexOf(game.screen);
      game.screen = SCREENS[(idx + 1) % SCREENS.length];
      lastRender = '';
      renderFrame();
      return;
    }

    // Arrow keys (escape sequences: \x1b[A/B/C/D)
    if (key === '\x1b[A' || key === '\x1b[B' || key === '\x1b[C' || key === '\x1b[D') {
      if (game.screen === 'collection' && !game.detailClaude) {
        const total = ALL_CLAUDES.length;
        if (total === 0) return;

        // 그리드 공간 이동: perRow는 렌더러와 동일하게 계산
        const W = Math.max(36, Math.min(80, process.stdout.columns || 50));
        const inner = W - 4;
        const cellVis = 6;
        const perRow = Math.max(1, Math.floor(inner / cellVis));

        // ALL_CLAUDES 내에서 현재 레리티 그룹의 로컬 위치 계산
        const curCl = ALL_CLAUDES[game.cursor];
        const curRarity = curCl ? curCl.rarity : 1;
        const rarityGroup = ALL_CLAUDES.filter(c => c.rarity === curRarity);
        const localIdx = rarityGroup.indexOf(curCl);
        const col = localIdx % perRow;
        const row = Math.floor(localIdx / perRow);

        if (key === '\x1b[C') {
          // → 같은 그룹 내 다음
          game.cursor = Math.min(total - 1, game.cursor + 1);
        } else if (key === '\x1b[D') {
          // ← 같은 그룹 내 이전
          game.cursor = Math.max(0, game.cursor - 1);
        } else if (key === '\x1b[B') {
          // ↓ 같은 열 아래 행, 없으면 다음 레리티 그룹 첫 번째
          const nextRow = row + 1;
          const nextLocalIdx = nextRow * perRow + col;
          if (nextLocalIdx < rarityGroup.length) {
            // 같은 레리티 내 아래 행
            game.cursor += perRow;
            if (game.cursor >= total) game.cursor = total - 1;
          } else {
            // 다음 레리티 그룹 첫 번째로 이동
            const nextRarity = curRarity + 1;
            if (nextRarity <= 5) {
              const nextGroupStart = ALL_CLAUDES.findIndex(c => c.rarity === nextRarity);
              if (nextGroupStart >= 0) {
                game.cursor = Math.min(nextGroupStart + Math.min(col, ALL_CLAUDES.filter(c => c.rarity === nextRarity).length - 1), total - 1);
              }
            }
          }
        } else if (key === '\x1b[A') {
          // ↑ 같은 열 위 행, 없으면 이전 레리티 그룹 마지막 행 같은 열
          const prevRow = row - 1;
          if (prevRow >= 0) {
            game.cursor -= perRow;
            if (game.cursor < 0) game.cursor = 0;
          } else {
            // 이전 레리티 그룹 마지막 행 같은 열로 이동
            const prevRarity = curRarity - 1;
            if (prevRarity >= 1) {
              const prevGroup = ALL_CLAUDES.filter(c => c.rarity === prevRarity);
              const prevGroupStart = ALL_CLAUDES.findIndex(c => c.rarity === prevRarity);
              if (prevGroup.length > 0) {
                const lastRow = Math.floor((prevGroup.length - 1) / perRow);
                const targetLocal = lastRow * perRow + Math.min(col, prevGroup.length - 1 - lastRow * perRow);
                game.cursor = prevGroupStart + targetLocal;
              }
            }
          }
        }

        // 범위 보정
        game.cursor = Math.max(0, Math.min(total - 1, game.cursor));

        lastRender = '';
        renderFrame();
      }
      return;
    }

    // Enter → open detail in collection (발견된 클로드만)
    if (key === '\r' || key === '\n') {
      if (game.screen === 'collection' && !game.detailClaude) {
        const cl = ALL_CLAUDES[game.cursor];
        if (cl && isDiscovered(game.persistent.collection, cl.id)) {
          game.detailClaude = cl;
          lastRender = '';
          renderFrame();
        }
      }
      return;
    }

    // Escape → back to garden or close detail
    if (key === '\x1b') {
      if (game.detailClaude) {
        game.detailClaude = null;
      } else {
        game.screen = 'garden';
      }
      lastRender = '';
      renderFrame();
      return;
    }

    // 1-4 → upgrade facility
    if (key >= '1' && key <= '4') {
      const idx = parseInt(key) - 1;
      game = upgrade(game, FACILITY_KEYS[idx]);
      lastRender = '';
      renderFrame();
      return;
    }
  });
}

// ─── Cleanup ───
function cleanup() {
  try { unlinkSync(PID_FILE); } catch {}
}

// ─── Start ───
clearScreen();
process.stdout.write(renderSplash() + '\n');

// Process existing events (in case session already started)
processNewLines();

setupKeyboard();

// Terminal resize
process.stdout.on('resize', () => {
  lastRender = '';
  if (game) renderFrame();
  else { clearScreen(); process.stdout.write(renderSplash() + '\n'); }
});

// 200ms polling
const interval = setInterval(processNewLines, 200);

// Cleanup handlers
process.on('SIGINT', () => { clearInterval(interval); cleanup(); process.exit(0); });
process.on('exit', cleanup);
process.on('SIGTERM', () => { cleanup(); process.exit(0); });
