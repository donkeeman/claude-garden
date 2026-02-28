#!/usr/bin/env node
import { mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const dir = join(homedir(), '.claude', 'claude-garden');
mkdirSync(dir, { recursive: true });

function main(input) {
  let session = 'unknown';
  try {
    const j = JSON.parse(input);
    session = j.session_id || 'unknown';
  } catch {}
  const ts = new Date().toISOString();
  appendFileSync(join(dir, 'events.jsonl'),
    JSON.stringify({ type: 'stop', session, ts }) + '\n');
}

let input = '';
let handled = false;
process.stdin.setEncoding('utf-8');
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  if (handled) return;
  handled = true;
  main(input);
});
setTimeout(() => {
  if (handled) return;
  handled = true;
  main(input);
}, 500);
