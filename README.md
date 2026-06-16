<div align="center">

<img src="./docs/banner.png" alt="crosmos for claude code" width="100%" />

# @crosmos/claude

<p><em>automatic, persistent context for claude code, powered by crosmos.</em></p>

</div>

<br>

You don't manage memory. You use Claude Code normally — relevant context is recalled when a
session starts, and your conversations are saved automatically. Nothing to remember, nothing
to type.

## Requirements

- Node 18+ (you already have it if you can run Claude Code).
- A crosmos api key (`csk_…`) from [console.crosmos.dev](https://console.crosmos.dev).

## Install

```sh
/plugin marketplace add crosmos-labs/claudecode-crosmos
/plugin install crosmos
```

## Authentication

The plugin reads your crosmos key from `~/.crosmos/credentials.json` — the same file the crosmos
CLI and console use, so if you've set up crosmos anywhere, it just works. To set it up, run this
**in your terminal** (not in the Claude session):

```sh
npx @crosmos/crosmos-mcp setup
```

Or grab a key from [console.crosmos.dev](https://console.crosmos.dev) and either drop it in
`~/.crosmos/credentials.json` or export `CROSMOS_API_KEY`. Your key is entered in your terminal,
never in the Claude conversation.

## How it works

No magic. Two lifecycle hooks run a single bundled script on Claude Code events — that's the
whole mechanism. Everything runs in-process via the `crosmos` sdk, secrets never leave your
machine, and the hooks **fail open**, so memory being unavailable never blocks your session.

| hook | runs on | does |
| --- | --- | --- |
| `SessionStart` | a session starts or resumes | recalls relevant memories and injects them |
| `Stop` | end of each turn | captures the new conversation and saves it |

- **Recall** — when a session starts, the most relevant memories for your project are pulled in silently.
- **Capture** — as a session progresses, new turns are saved to crosmos automatically.
- **`/crosmos-recall`** — ask Claude to look something up on demand.
- **`/crosmos-save`** — ask Claude to save a specific note when you want to be explicit.

## Commands

```sh
/crosmos:status          # show api key status, resolved space, and connectivity
```

## Configuration

Set via environment variables.

| env | purpose |
| --- | --- |
| `CROSMOS_API_KEY` | api key (overrides the credentials file) |
| `CROSMOS_API_BASE_URL` | api base url (default `https://api.crosmos.dev`) |
| `CROSMOS_SPACE_ID` / `CROSMOS_SPACE_NAME` | pin a memory space (otherwise the first space is used) |
| `CROSMOS_DEBUG` | write a debug log to `<tmp>/crosmos-claude.log` |

## Development

```sh
npm install
npm run build      # esbuild → plugin/scripts/crosmos.cjs (single node-runnable file)
npm run typecheck  # tsc --noEmit
npm run lint       # biome
```

The hooks and skills run the bundled `plugin/scripts/crosmos.cjs`. It's committed so the plugin
installs with no `node_modules` on the user's machine.

## License

MIT.
