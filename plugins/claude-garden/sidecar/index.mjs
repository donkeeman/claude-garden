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
        // Build display-order list matching renderer (rarity 1-5, no secrets in git ver)
        const displayOrder = [];
        for (let r = 1; r <= 5; r++) {
          displayOrder.push(...ALL_CLAUDES.filter(c => c.rarity === r));
        }

        const total = displayOrder.length;
        if (total === 0) return;

        // Map cursor from ALL_CLAUDES index to display index
        const curCl = ALL_CLAUDES[game.cursor];
        let dispIdx = displayOrder.indexOf(curCl);
        if (dispIdx < 0) dispIdx = 0;

        const W = Math.max(36, Math.min(80, process.stdout.columns || 50));
        const inner = W - 4;
        const cellVis = 6;
        const perRow = Math.max(1, Math.floor(inner / cellVis));

        // Find current rarity group in display order
        const curRarity = displayOrder[dispIdx]?.rarity || 1;
        const groupStart = displayOrder.findIndex(c => c.rarity === curRarity);
        const groupEnd = displayOrder.filter(c => c.rarity === curRarity).length;
        const localIdx = dispIdx - groupStart;
        const col = localIdx % perRow;
        const row = Math.floor(localIdx / perRow);

        if (key === '\x1b[C') {
          dispIdx = Math.min(total - 1, dispIdx + 1);
        } else if (key === '\x1b[D') {
          dispIdx = Math.max(0, dispIdx - 1);
        } else if (key === '\x1b[B') {
          const nextRow = row + 1;
          const nextLocalIdx = nextRow * perRow + col;
          if (nextLocalIdx < groupEnd) {
            dispIdx = groupStart + nextLocalIdx;
          } else {
            const nextGroupStart = displayOrder.findIndex(c => c.rarity > curRarity);
            if (nextGroupStart >= 0) {
              const nextGroup = displayOrder.filter(c => c.rarity === displayOrder[nextGroupStart].rarity);
              dispIdx = nextGroupStart + Math.min(col, nextGroup.length - 1);
            }
          }
        } else if (key === '\x1b[A') {
          const prevRow = row - 1;
          if (prevRow >= 0) {
            dispIdx = groupStart + prevRow * perRow + col;
          } else {
            const prevClaudes = displayOrder.filter(c => c.rarity < curRarity);
            if (prevClaudes.length > 0) {
              const prevRarity = prevClaudes[prevClaudes.length - 1].rarity;
              const prevGroup = displayOrder.filter(c => c.rarity === prevRarity);
              const prevGroupStart = displayOrder.findIndex(c => c.rarity === prevRarity);
              const lastRow = Math.floor((prevGroup.length - 1) / perRow);
              const targetLocal = lastRow * perRow + Math.min(col, prevGroup.length - 1 - lastRow * perRow);
              dispIdx = prevGroupStart + targetLocal;
            }
          }
        }

        dispIdx = Math.max(0, Math.min(total - 1, dispIdx));
        game.cursor = ALL_CLAUDES.indexOf(displayOrder[dispIdx]);
        if (game.cursor < 0) game.cursor = 0;

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
process.on('exit', () => { clearInterval(interval); cleanup(); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });
