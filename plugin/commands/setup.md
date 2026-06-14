---
description: Save your Crosmos API key (csk_…) so the plugin can recall and store memory.
allowed-tools: Bash(node:*)
argument-hint: <api-key>
---

Save the user's Crosmos API key. If `$ARGUMENTS` is empty, ask them for their `csk_…` key (from console.crosmos.dev) first.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/crosmos.cjs" setup "$ARGUMENTS"
```
