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

# Auto-launch sidecar (macOS)
if [ "$(uname)" = "Darwin" ]; then
  SIDECAR_RUNNING=false
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
      SIDECAR_RUNNING=true
    fi
  fi

  if [ "$SIDECAR_RUNNING" = "false" ]; then
    PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
    SIDECAR_CMD="$PLUGIN_DIR/start.sh"

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
  fi
fi

exit 0
