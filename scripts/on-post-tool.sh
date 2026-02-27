#!/bin/bash
INPUT=$(cat)
EVENT_FILE="$HOME/.claude/claude-garden/events.jsonl"
mkdir -p "$(dirname "$EVENT_FILE")"

TOOL=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
SESSION=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "{\"type\":\"post_tool\",\"tool\":\"$TOOL\",\"session\":\"$SESSION\",\"ts\":\"$TS\"}" >> "$EVENT_FILE"
exit 0
