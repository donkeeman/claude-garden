#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = join(homedir(), '.claude', 'claude-garden');
mkdirSync(dir, { recursive: true });

const eventsFile = join(dir, 'events.jsonl');
const pidFile = join(dir, 'sidecar.pid');

// Read stdin
let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  let session = 'unknown';
  try {
    const j = JSON.parse(input);
    session = j.session_id || 'unknown';
  } catch {}

  const ts = new Date().toISOString();
  // Clear previous events, write session start
  writeFileSync(eventsFile, JSON.stringify({ type: 'session_start', session, ts }) + '\n');

  // Check if sidecar is already running
  if (isSidecarRunning()) return;

  // Launch sidecar in a new terminal
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pluginDir = join(__dirname, '..');
  launchSidecar(pluginDir);
});

function isSidecarRunning() {
  if (!existsSync(pidFile)) return false;
  const pid = readFileSync(pidFile, 'utf-8').trim();
  if (!pid) return false;

  try {
    if (platform() === 'win32') {
      const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      return out.includes(pid);
    } else {
      process.kill(Number(pid), 0);
      return true;
    }
  } catch {
    return false;
  }
}

function launchSidecar(pluginDir) {
  const startScript = join(pluginDir, 'start.sh');
  const os = platform();

  if (os === 'win32') {
    // Windows: use start command to open a new console window running node directly
    const sidecarEntry = join(pluginDir, 'sidecar', 'index.mjs');
    try {
      // Try Windows Terminal first
      spawn('cmd.exe', ['/c', 'start', 'Claude Garden', 'node', sidecarEntry], {
        detached: true,
        stdio: 'ignore',
        cwd: pluginDir,
      }).unref();
    } catch {
      // Fallback
      spawn('cmd.exe', ['/c', 'start', '', 'node', sidecarEntry], {
        detached: true,
        stdio: 'ignore',
        cwd: pluginDir,
      }).unref();
    }
  } else if (os === 'darwin') {
    // macOS
    const cmd = `bash -l -c '${startScript}'`;
    try {
      spawn('osascript', ['-e', `tell application "Terminal" to do script "${cmd}"`], {
        detached: true, stdio: 'ignore',
      }).unref();
    } catch {}
  } else {
    // Linux
    const terminals = ['x-terminal-emulator', 'gnome-terminal', 'xterm'];
    for (const term of terminals) {
      try {
        execSync(`which ${term}`, { stdio: 'pipe' });
        if (term === 'gnome-terminal') {
          spawn(term, ['--', 'bash', '-l', '-c', startScript], { detached: true, stdio: 'ignore' }).unref();
        } else {
          spawn(term, ['-e', 'bash', '-l', '-c', startScript], { detached: true, stdio: 'ignore' }).unref();
        }
        break;
      } catch {}
    }
  }
}
