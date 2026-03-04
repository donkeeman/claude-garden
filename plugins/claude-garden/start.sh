#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$HOME/.claude/claude-garden/sidecar.log"

node "$SCRIPT_DIR/sidecar/index.mjs" 2>"$LOG_FILE"
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "Sidecar crashed (exit: $EXIT_CODE)"
  echo "Log: $LOG_FILE"
  cat "$LOG_FILE" 2>/dev/null
  echo ""
  echo "Press any key to close..."
  read -n 1
fi
