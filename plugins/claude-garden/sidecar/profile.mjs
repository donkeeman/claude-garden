// Claude Garden — Profile card generator and clipboard module

import { execSync } from 'node:child_process';
import { platform, userInfo } from 'node:os';
import { ALL_CLAUDES, RARITY_STARS, RARITY_NAMES } from './claudes.mjs';
import { getDiscoveredIds } from './game.mjs';
import { getEquippedTitle } from './achievements.mjs';

const CARD_WIDTH = 36; // total width including border chars ║...║

// Returns the visual (terminal column) width of a string,
// counting fullwidth/CJK characters as 2 columns.
function visWidth(str) {
  let w = 0;
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (
      (cp >= 0x1100  && cp <= 0x115F)  || // Hangul Jamo
      (cp >= 0x2E80  && cp <= 0x303E)  || // CJK Radicals
      (cp >= 0x3040  && cp <= 0x33BF)  || // Hiragana/Katakana/CJK compat
      (cp >= 0x3400  && cp <= 0x4DBF)  || // CJK Ext A
      (cp >= 0x4E00  && cp <= 0x9FFF)  || // CJK Unified
      (cp >= 0xAC00  && cp <= 0xD7AF)  || // Hangul Syllables
      (cp >= 0xF900  && cp <= 0xFAFF)  || // CJK Compat Ideographs
      (cp >= 0xFE30  && cp <= 0xFE6F)  || // CJK Compat Forms
      (cp >= 0xFF01  && cp <= 0xFF60)  || // Fullwidth Forms
      (cp >= 0xFFE0  && cp <= 0xFFE6)  || // Fullwidth Signs
      (cp >= 0x20000 && cp <= 0x2FA1F)    // CJK Ext B-F
    ) {
      w += 2;
    } else {
      w += 1;
    }
  }
  return w;
}

// Pad a string to fill `width` visual columns, centering it.
// Uses spaces on both sides; biases extra space to the right.
function centerPad(str, width) {
  const vw = visWidth(str);
  const total = width - vw;
  if (total <= 0) return str;
  const left = Math.floor(total / 2);
  const right = total - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

// Pad a string to fill `width` visual columns, left-aligned.
function leftPad(str, width) {
  const vw = visWidth(str);
  const pad = width - vw;
  return str + (pad > 0 ? ' '.repeat(pad) : '');
}

// Build a single card row: ║<content>║ where content is exactly CARD_WIDTH-2 wide.
function row(content) {
  return '║' + content + '║';
}

// Build a centered row.
function centerRow(str) {
  return row(centerPad(str, CARD_WIDTH - 2));
}

// Build a left-padded row with 2-space left margin.
function leftRow(str) {
  const inner = leftPad('  ' + str, CARD_WIDTH - 2);
  return row(inner);
}

// Blank row.
function blankRow() {
  return row(' '.repeat(CARD_WIDTH - 2));
}

// Divider row.
function divider() {
  return '╠' + '═'.repeat(CARD_WIDTH - 2) + '╣';
}

export function generateCard(persistent) {
  const lines = [];

  // ── Top border ──────────────────────────────────────────────
  lines.push('╔' + '═'.repeat(CARD_WIDTH - 2) + '╗');

  // ── Title bar ───────────────────────────────────────────────
  lines.push(centerRow('Claude Garden'));

  let defaultName = 'Anonymous';
  try { defaultName = userInfo().username || defaultName; } catch {}
  const nickname = persistent.nickname || defaultName;
  const equippedTitle = getEquippedTitle(persistent);
  const headerLine = equippedTitle
    ? `${nickname}  "${equippedTitle}"`
    : nickname;
  lines.push(centerRow(headerLine));

  // ── Divider ─────────────────────────────────────────────────
  lines.push(divider());

  // ── Favorite Claude sprite ───────────────────────────────────
  const favId = persistent.favoriteClaude;
  const fav = favId ? ALL_CLAUDES.find(c => c.id === favId) : null;

  lines.push(blankRow());

  if (fav && fav.sprite) {
    // Each sprite line is 13 chars wide; inner content area is CARD_WIDTH-2=34
    // Center each sprite line within the inner area
    for (const spriteLine of fav.sprite) {
      lines.push(centerRow(spriteLine));
    }

    lines.push(blankRow());

    // Name + rarity stars + rarity name
    const rarityStr = `${RARITY_STARS[fav.rarity]} ${RARITY_NAMES[fav.rarity]}`;
    lines.push(centerRow(`${fav.name} ${rarityStr}`));
  } else {
    // Fill 6 sprite lines + 1 name line with blanks + message
    lines.push(blankRow());
    lines.push(blankRow());
    lines.push(centerRow('No favorite set'));
    lines.push(blankRow());
    lines.push(blankRow());
    lines.push(blankRow());
  }

  lines.push(blankRow());

  // ── Divider ─────────────────────────────────────────────────
  lines.push(divider());

  // ── Stats ────────────────────────────────────────────────────
  const discoveredIds = getDiscoveredIds(persistent.collection || {});
  const nonSecretTotal = ALL_CLAUDES.filter(c => !c.secret).length;
  const discoveredCount = discoveredIds.filter(id => {
    const claude = ALL_CLAUDES.find(c => c.id === id);
    return claude && !claude.secret;
  }).length;
  const pct = nonSecretTotal > 0 ? Math.floor((discoveredCount / nonSecretTotal) * 100) : 0;

  const totalCoins = (persistent.totalCoins ?? persistent.coins ?? 0).toLocaleString();
  const gachaPulls = persistent.gacha?.totalPulls ?? 0;
  const sessions = persistent.stats?.sessionsPlayed ?? 0;

  lines.push(leftRow(`Collection  ${discoveredCount}/${nonSecretTotal} (${pct}%)`));

  // Rarity breakdown (initials to avoid ★ width ambiguity)
  const RARITY_INITIALS = ['', 'C', 'U', 'R', 'E', 'L'];
  const rarityParts = [];
  for (let r = 1; r <= 5; r++) {
    const count = discoveredIds.filter(id => {
      const cl = ALL_CLAUDES.find(c => c.id === id);
      return cl && cl.rarity === r && !cl.secret;
    }).length;
    rarityParts.push(`${count}${RARITY_INITIALS[r]}`);
  }
  lines.push(leftRow(rarityParts.join(' ')));

  lines.push(leftRow(`Coins       ${totalCoins}`));
  lines.push(leftRow(`Gacha       ${gachaPulls} pulls`));
  lines.push(leftRow(`Sessions    ${sessions}`));

  // Since date — earliest firstSeen in collection
  const collection = persistent.collection || {};
  const dates = Object.values(collection).map(v => v.firstSeen).filter(Boolean);
  if (dates.length > 0) {
    const since = dates.sort()[0];
    lines.push(leftRow(`Since       ${since}`));
  }

  // ── Install command footer ───────────────────────────────────
  lines.push(divider());
  lines.push(centerRow('claude plugin add claude-garden'));

  // ── Bottom border ────────────────────────────────────────────
  lines.push('╚' + '═'.repeat(CARD_WIDTH - 2) + '╝');

  return lines.join('\n');
}

export function copyToClipboard(text) {
  const os = platform();
  try {
    if (os === 'win32') {
      execSync('clip', { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
    } else if (os === 'darwin') {
      execSync('pbcopy', { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
    } else {
      // Linux: try xclip first, fall back to xsel
      try {
        execSync('xclip -selection clipboard', { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
      } catch {
        execSync('xsel --clipboard --input', { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
      }
    }
    return true;
  } catch {
    return false;
  }
}
