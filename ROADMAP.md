# crosmos-claude — Roadmap

A Claude Code memory plugin for crosmos. Built SDK-direct (the `crosmos` TS SDK in-process,
esbuild-bundled), distributed through the `/plugin` marketplace flow. Primary goal: **simple implementation + the agent uses memory
automatically, without the user having to think about it.**

---

## v0 scope (what's built)

Deliberately minimal — prove the loop end-to-end, then iterate.

- **Distribution:** marketplace plugin. Repo doubles as its own marketplace
  (`.claude-plugin/marketplace.json` + `plugin/.claude-plugin/plugin.json`). Installed via
  `/plugin marketplace add … ` → `/plugin install crosmos`. Self-contained esbuild bundle at
  `plugin/scripts/crosmos.cjs` (SDK inlined; committed, so no `node_modules` on the user's machine).
- **Backend:** SDK-direct in-process (`crosmos` SDK → REST). No MCP in the hot path.
- **Auth:** out-of-band setup only — reads `~/.crosmos/credentials.json` (populated via
  `npx @crosmos/crosmos-mcp setup` or the console; shared with crosmos-mcp, `base_url` honored) or
  `CROSMOS_API_KEY` env. No in-product key entry — the key never enters the Claude session.
- **Scoping:** single resolved + cached space (`CROSMOS_SPACE_ID` → `CROSMOS_SPACE_NAME` →
  first space). Env takes precedence over the cache. `project` attached as ingest `meta`.
- **Recall (ambient):** one hook — `SessionStart` (`startup|resume`). One `search.hybrid`
  (query = project + normalized branch words, `recency_bias 0.6`, `diversify`, limit 6), injected
  via `additionalContext` wrapped in `<crosmos-memory>` with a relevance disclaimer.
- **Capture:** one hook — `Stop`. Delta transcript turns since last capture (tracked per session),
  4-word substantiality gate, fire-and-forget `conversations.ingest` with `session_id` + project meta.
- **Skills:** `crosmos-recall` (proactive search) and `crosmos-save` (explicit + proactive distill).
- **Commands:** `/crosmos:status`, `/crosmos:setup`.
- **Config/state:** `${CLAUDE_PLUGIN_DATA}` or `~/.crosmos` → `store.json` (cached `spaceId`,
  per-session `lastLine`). Debug log to `<tmp>/crosmos-claude.log` when `CROSMOS_DEBUG` is set.

---

## Deferred to v1+ (tracked from v0 decisions)

### Recall prioritization — the headline gap (latency-blocked)
- [ ] **`UserPromptSubmit` deterministic per-prompt recall.** Run `search.hybrid` on each prompt
      and inject hits so the agent *always* has relevant memory in context — it never has to
      "decide" to search (today's model-invoked skill loses to the agent's filesystem instinct,
      e.g. "status of my torrent-tui project" went straight to git, never to memory).
      **Blocked:** backend retrieval isn't reliably ~few hundred ms yet, so this would add visible
      per-turn latency. Revisit once retrieval is optimized.
- [ ] **Imperative "memory is primary" SessionStart directive.** Flip the soft "reference only when
      relevant" framing into a standing "recall before answering questions about the user's
      work/projects/preferences" instruction. Zero latency cost — can ship independently of the
      hook above; pending decision.
- [ ] Recall gating once per-prompt recall lands (cache-per-session vs cue-regex vs cheap Haiku gate).

### Recall quality
- [ ] Switch ambient recall to the backend **digest/profile endpoint** when it ships
      (`{static[], dynamic[]}` in one call), replacing the project-name search query.
      Backend work required.
- [ ] Tune the recall query: A/B dropping the word "recent" (it likely triggers the engine's
      temporal-range extraction → can hard-filter the candidate pool) and lean on `recency_bias`
      instead; consider two targeted queries (preferences + recent project work) merged.
- [ ] Broaden ambient recall to **user-wide / cross-project** context, not just the current project.
- [ ] Per-session injected-fact dedup (don't re-inject the same memories on resume/compact).
- [ ] `PostCompact` re-injection so memory survives compaction.

### Capture
- [ ] `PreCompact` flush (capture pending turns before context is compacted).
- [ ] Secret/credential redaction before ingest (codex plugin does this; we don't yet).
- [ ] Job-status polling / capture confirmation (vs fire-and-forget).
- [ ] Capture cadence tuning (batch by N turns, signal-based turn filtering).

### Scoping
- [ ] User-level vs project-level memory separation (separate user-wide and per-project
      containers). **Blocked:** backend has no free-form user/project tags; everything is a space.
- [ ] Per-project auto-resolved spaces (repo → space mapping).
- [ ] Branch / git-worktree-aware scoping.

### Distribution
- [ ] Optional `.mcp.json` for power users (callable memory tools in-conversation), opt-in.
- [ ] Publish to the Anthropic community marketplace (`claude-plugins-community` submission).

### Auth (deferred — not yet designed)
- [ ] Improve auth/onboarding beyond manual key paste. Approach is **undecided** — do not assume
      any specific flow (browser / loopback / OAuth / org-selection) until it's actually designed.
      Today: `CROSMOS_API_KEY` env or `~/.crosmos/credentials.json`.

### Native memory
- [ ] Decide: coexist with Claude's native memory tool (current default) vs. a `PreToolUse` deny so
      Crosmos is the single source of truth.

### Backend asks
- [ ] **Lower retrieval latency** (unblocks per-prompt recall — the top item above).
- [ ] `digest`/`profile` endpoint (`{static[], dynamic[]}`).
- [ ] Natural-language `forget` endpoint (for a future `/crosmos-forget`).
- [ ] Free-form user/project tags on search (or a sanctioned per-project space pattern).

### Quality / infra
- [ ] Unit tests (transcript parsing, space resolution, config/store, ingest delta, branch normalization).
- [ ] Live e2e test of the capture (write) path against the API.
- [ ] CI (typecheck + lint + test; verify the committed bundle matches `src/`).
