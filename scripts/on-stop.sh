#!/bin/bash
INPUT=$(cat)
EVENT_FILE="$HOME/.claude/claude-garden/events.jsonl"
mkdir -p "$(dirname "$EVENT_FILE")"

SESSION=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "{\"type\":\"stop\",\"session\":\"$SESSION\",\"ts\":\"$TS\"}" >> "$EVENT_FILE"
exit 0
