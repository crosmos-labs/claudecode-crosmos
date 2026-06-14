---
name: crosmos-save
description: Save a durable fact, decision, or preference to Crosmos memory so it persists across sessions. Use when the user asks to remember something, OR proactively when the conversation reveals a lasting preference, a decision and its rationale, a project convention, an identity/context fact, or a correction to something known. Skip transient task details, secrets, and your own suggestions.
allowed-tools: Bash(node:*)
---

# crosmos save

Persist durable facts to Crosmos memory. Routine conversation is already captured automatically — use this to record distilled, lasting facts worth surfacing in future sessions, without waiting to be asked.

## Save when the conversation reveals
- **Preferences** — how the user likes things done (e.g. "prefers pnpm over npm", "wants Vitest, not Jest").
- **Decisions + rationale** — lasting choices (e.g. "chose Postgres over Mongo for transactional integrity").
- **Conventions / rules** — durable ways of working (e.g. "always run `make lint` before pushing", "API errors follow RFC 7807").
- **Identity / context** — role, ownership, environment (e.g. "maintains the billing service", "deploys to GCP").
- **Corrections** — when the user contradicts something known; save the new state.
- **Reusable learnings** — a non-obvious gotcha or fix worth recalling later.

## Don't save
- One-off task details, or anything plainly derivable from the repo/code.
- Secrets, credentials, or PII.
- Your own suggestions or assistant text — only facts about the user and their work.
- Something already in memory (unless it changed).

## How to save
Write each memory as **one atomic, self-contained sentence** — use names, not pronouns — then run it. Save distinct facts as separate calls.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/crosmos.cjs" save "<fact>"
```

Confirm briefly once saved. When unsure whether something is durable, prefer saving a concise version over losing it.

## Examples
- "let's always deploy from the `release` branch" → save: `The user deploys this project from the release branch.`
- "thanks, that worked!" → save nothing (no durable fact).
