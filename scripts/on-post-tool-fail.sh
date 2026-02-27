#!/bin/bash
INPUT=$(cat)
EVENT_FILE="$HOME/.claude/claude-garden/events.jsonl"
mkdir -p "$(dirname "$EVENT_FILE")"

# Parse fields without jq (grep + sed)
TOOL=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/')
SESSION=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)"/\1/')
[ -z "$TOOL" ] && TOOL="unknown"
[ -z "$SESSION" ] && SESSION="unknown"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "{\"type\":\"post_tool_fail\",\"tool\":\"$TOOL\",\"session\":\"$SESSION\",\"ts\":\"$TS\"}" >> "$EVENT_FILE"
exit 0
