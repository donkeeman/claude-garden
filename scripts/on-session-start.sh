#!/bin/bash
INPUT=$(cat)
EVENT_FILE="$HOME/.claude/claude-garden/events.jsonl"
PID_FILE="$HOME/.claude/claude-garden/sidecar.pid"
mkdir -p "$(dirname "$EVENT_FILE")"

# Parse session_id without jq (grep + sed)
SESSION=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/')
[ -z "$SESSION" ] && SESSION="unknown"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Clear previous events, write session start
: > "$EVENT_FILE"
echo "{\"type\":\"session_start\",\"session\":\"$SESSION\",\"ts\":\"$TS\"}" >> "$EVENT_FILE"

# Check if sidecar is already running
SIDECAR_RUNNING=false
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" 2>/dev/null)
  if [ -n "$PID" ]; then
    UNAME_S="$(uname -s)"
    if [[ "$UNAME_S" == MINGW* ]] || [[ "$UNAME_S" == MSYS* ]] || [ -n "$WINDIR" ]; then
      # Windows: check via tasklist
      tasklist //FI "PID eq $PID" 2>/dev/null | grep -q "$PID" && SIDECAR_RUNNING=true
    else
      kill -0 "$PID" 2>/dev/null && SIDECAR_RUNNING=true
    fi
  fi
fi

if [ "$SIDECAR_RUNNING" = "false" ]; then
  PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
  SIDECAR_CMD="$PLUGIN_DIR/start.sh"

  case "$(uname -s)" in
    Darwin)
      # macOS
      if [ "$TERM_PROGRAM" = "iTerm.app" ]; then
        osascript -e "
          tell application \"iTerm2\"
            tell current session of current tab of current window
              split vertically with default profile command \"bash -l -c '$SIDECAR_CMD'\"
            end tell
          end tell
        " &>/dev/null &
      else
        osascript -e "
          tell application \"Terminal\"
            do script \"bash -l -c '$SIDECAR_CMD'\"
          end tell
        " &>/dev/null &
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*)
      # Windows (Git Bash / MSYS2 / Cygwin)
      # Must use Git Bash's bash.exe (not WSL's) — get Windows-style path
      BASH_WIN="$(cygpath -w /usr/bin/bash 2>/dev/null)"
      SIDECAR_CMD_WIN="$(cygpath -w "$SIDECAR_CMD" 2>/dev/null || echo "$SIDECAR_CMD")"
      if command -v wt.exe &>/dev/null && [ -n "$BASH_WIN" ]; then
        # Windows Terminal — open new tab with Git Bash
        wt.exe new-tab --title "Claude Garden" -- "$BASH_WIN" -l -c "$SIDECAR_CMD" &>/dev/null &
      elif command -v mintty &>/dev/null; then
        # Git Bash native terminal
        mintty --title "Claude Garden" -e bash -l -c "$SIDECAR_CMD" &>/dev/null &
      elif command -v powershell.exe &>/dev/null && [ -n "$BASH_WIN" ]; then
        # Fallback: PowerShell spawns a new window
        powershell.exe -NoProfile -Command "Start-Process '$BASH_WIN' -ArgumentList '-l','-c','$SIDECAR_CMD_WIN'" &>/dev/null &
      fi
      ;;
    Linux)
      # Linux — try common terminal emulators
      if command -v x-terminal-emulator &>/dev/null; then
        x-terminal-emulator -e bash -l -c "$SIDECAR_CMD" &>/dev/null &
      elif command -v gnome-terminal &>/dev/null; then
        gnome-terminal -- bash -l -c "$SIDECAR_CMD" &>/dev/null &
      elif command -v xterm &>/dev/null; then
        xterm -e bash -l -c "$SIDECAR_CMD" &>/dev/null &
      fi
      ;;
  esac
fi

exit 0
