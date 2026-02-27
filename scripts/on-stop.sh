#!/bin/bash
INPUT=$(cat)
EVENT_FILE="$HOME/.claude/claude-garden/events.jsonl"
mkdir -p "$(dirname "$EVENT_FILE")"

# Parse session_id without jq (grep + sed)
SESSION=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/')
[ -z "$SESSION" ] && SESSION="unknown"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "{\"type\":\"stop\",\"session\":\"$SESSION\",\"ts\":\"$TS\"}" >> "$EVENT_FILE"
exit 0
