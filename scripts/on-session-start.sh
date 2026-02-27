#!/bin/bash
INPUT=$(cat)
EVENT_FILE="$HOME/.claude/claude-garden/events.jsonl"
PID_FILE="$HOME/.claude/claude-garden/sidecar.pid"
mkdir -p "$(dirname "$EVENT_FILE")"

SESSION=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
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
      PLUGIN_DIR_WIN="$(cygpath -w "$PLUGIN_DIR" 2>/dev/null || echo "$PLUGIN_DIR")"
      if command -v wt.exe &>/dev/null; then
        # Windows Terminal
        wt.exe new-tab --title "Claude Garden" -- bash -l -c "$SIDECAR_CMD" &>/dev/null &
      elif command -v powershell.exe &>/dev/null; then
        # Fallback: PowerShell spawns a new cmd window
        powershell.exe -NoProfile -Command "Start-Process cmd -ArgumentList '/c','bash','-l','-c','\"$SIDECAR_CMD\"'" &>/dev/null &
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
