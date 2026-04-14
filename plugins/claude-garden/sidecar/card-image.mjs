// Card text → pixel buffer → PNG file.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { getGlyph, unicodeToCp437, GLYPH_WIDTH, GLYPH_HEIGHT } from './font-cp437.mjs';
import { encodePng } from './png-encoder.mjs';
import { generateCard } from './profile.mjs';

const CARDS_DIR = join(homedir(), '.claude', 'claude-garden', 'cards');

// Colors (RGBA). Orange on dark background matches the sidecar theme.
const FG = [0xFF, 0xA8, 0x60, 0xFF]; // orange
const BG = [0x1A, 0x1A, 0x1A, 0xFF]; // near-black

// Measure longest line in visual width (CP437 chars are always 1 column).
// We count codepoints, not JS string length, because some Unicode
// characters use surrogate pairs but represent a single glyph.
function measureLines(text) {
  const lines = text.split('\n');
  let cols = 0;
  for (const line of lines) {
    const len = [...line].length;
    if (len > cols) cols = len;
  }
  return { lines, cols, rows: lines.length };
}

/**
 * Render card text as an RGBA pixel buffer.
 * Returns { pixels, width, height }.
 */
export function renderCardToPixels(cardText) {
  const { lines, cols, rows } = measureLines(cardText);
  const width = cols * GLYPH_WIDTH;
  const height = rows * GLYPH_HEIGHT;
  const pixels = Buffer.alloc(width * height * 4);

  // Fill with background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = BG[0];
    pixels[i + 1] = BG[1];
    pixels[i + 2] = BG[2];
    pixels[i + 3] = BG[3];
  }

  // Blit each char
  for (let row = 0; row < rows; row++) {
    const chars = [...lines[row]];
    for (let col = 0; col < chars.length; col++) {
      const cp = unicodeToCp437(chars[col]);
      const glyph = getGlyph(cp);
      const baseX = col * GLYPH_WIDTH;
      const baseY = row * GLYPH_HEIGHT;

      for (let gy = 0; gy < GLYPH_HEIGHT; gy++) {
        const rowBits = glyph[gy];
        for (let gx = 0; gx < GLYPH_WIDTH; gx++) {
          // MSB = leftmost pixel
          if (rowBits & (0x80 >> gx)) {
            const px = baseX + gx;
            const py = baseY + gy;
            const idx = (py * width + px) * 4;
            pixels[idx] = FG[0];
            pixels[idx + 1] = FG[1];
            pixels[idx + 2] = FG[2];
            pixels[idx + 3] = FG[3];
          }
        }
      }
    }
  }

  return { pixels, width, height };
}

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Generate and save the card as a PNG file.
 * Returns the absolute path on success, or null on failure.
 */
export function saveCardImage(persistent) {
  try {
    if (!existsSync(CARDS_DIR)) mkdirSync(CARDS_DIR, { recursive: true });
    const cardText = generateCard(persistent);
    const { pixels, width, height } = renderCardToPixels(cardText);
    const png = encodePng(pixels, width, height);
    const filename = `card-${timestamp()}.png`;
    const filepath = join(CARDS_DIR, filename);
    writeFileSync(filepath, png);
    return filepath;
  } catch (e) {
    return null;
  }
}
