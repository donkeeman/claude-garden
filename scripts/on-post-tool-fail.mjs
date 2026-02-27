#!/usr/bin/env node
import { mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const dir = join(homedir(), '.claude', 'claude-garden');
mkdirSync(dir, { recursive: true });

let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  let tool = 'unknown', session = 'unknown';
  try {
    const j = JSON.parse(input);
    tool = j.tool_name || 'unknown';
    session = j.session_id || 'unknown';
  } catch {}
  const ts = new Date().toISOString();
  appendFileSync(join(dir, 'events.jsonl'),
    JSON.stringify({ type: 'post_tool_fail', tool, session, ts }) + '\n');
});
