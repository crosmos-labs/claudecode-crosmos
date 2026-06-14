---
name: crosmos-recall
description: Search Crosmos memory for relevant past context. Use proactively before answering anything that could depend on the user's history, preferences, prior decisions, or earlier sessions — references to past work ("like before", "the usual way"), underspecified asks, or preference-dependent tasks. Skip when the answer is already in front of you or it's a self-contained, generic question.
allowed-tools: Bash(node:*)
---

# crosmos recall

Pull relevant memory before answering. When in doubt, search — missing context is costlier than an extra lookup.

## Search before answering when
- The request references past work or earlier sessions ("like before", "the usual setup", "what we decided").
- It's underspecified and a stored preference or decision would resolve it.
- The task is preference- or convention-dependent (how *this* user likes things done).

## Don't search when
- The answer is already in context — the current message, open files, or memory already recalled this session. Don't re-fetch what you can already see.
- It's a self-contained, generic factual or coding question with no user-specific dependency.

## How to search
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/crosmos.cjs" search "<query or keywords>"
```

Weave relevant results into your answer naturally; ignore ones that don't fit. If nothing relevant returns, continue normally.

## Examples
- "set up the linter like my other projects" → search `linter setup preferences` first.
- "what's the syntax for a Python list comprehension?" → no search (generic, self-contained).
