# Claude Garden

Idle collection game sidecar for Claude Code. Collect unique Claude variants as you code.

## How it works

Claude Garden runs as a terminal sidecar alongside Claude Code. Every time Claude uses a tool, there's a chance a Claude variant spawns in your garden. Collect them, discover rare ones, and upgrade your facilities.

### Game mechanics

- **Tool calls** earn coins and have a 55% chance to spawn a Claude
- **29 Claude variants** across 5 rarity tiers (Common → Legendary)
- **4 upgradeable facilities**: GPU (coins/tool), RAM (garden slots), Cooling (rare multiplier), Antenna (max rarity)
- **Duplicates** give bonus coins based on rarity
- **Tool failures** cost you coins

### Controls

| Key | Action |
|-----|--------|
| `Space` | Collect all Claudes in garden |
| `Tab` | Switch screen (Garden → Collection → Upgrades) |
| `1-4` | Upgrade facility |
| `Arrow keys` | Navigate collection |
| `Enter` | View Claude detail |
| `Esc` | Back |
| `Ctrl+C` | Quit sidecar |

## Installation

### Via marketplace (recommended)

```
/plugin marketplace add donkeeman/claude-garden
/plugin install claude-garden@donkeeman-claude-garden
```

### Manual

```bash
git clone https://github.com/donkeeman/claude-garden ~/.claude/plugins/claude-garden
```

The sidecar auto-launches in a new terminal tab when a Claude Code session starts. Supported on macOS (Terminal, iTerm2), Windows (cmd, PowerShell, Git Bash), and Linux (gnome-terminal, xterm, x-terminal-emulator).

## Structure

```
claude-garden/
├── .claude-plugin/
│   ├── plugin.json        # Plugin metadata
│   └── marketplace.json   # Marketplace metadata
├── hooks/
│   └── hooks.json          # Hook event bindings
├── scripts/
│   ├── on-session-start.mjs # Starts sidecar + logs session
│   ├── on-post-tool.mjs     # Logs tool use events
│   ├── on-post-tool-fail.mjs# Logs tool failures
│   └── on-stop.mjs          # Logs session end
├── sidecar/
│   ├── index.mjs           # Main loop (JSONL watcher + keyboard)
│   ├── game.mjs            # Game state machine
│   ├── renderer.mjs        # ANSI terminal renderer
│   ├── claudes.mjs         # All 29 Claude variant definitions
│   └── facilities.mjs      # Upgrade system definitions
└── start.sh                # Sidecar entry point
```

## Requirements

- Node.js (for sidecar and hook scripts)
- A terminal that supports Unicode box-drawing characters and ANSI colors

## License

MIT
