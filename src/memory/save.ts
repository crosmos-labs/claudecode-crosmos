import { basename } from "node:path";
import type Crosmos from "crosmos";
import { gitBranch, repoId } from "../lib/git.js";
import { redactSecrets } from "../lib/redact.js";
import { resolveSpaceId } from "./space.js";

export async function save(client: Crosmos, text: string, cwd: string): Promise<string> {
    const spaceId = await resolveSpaceId(client);
    if (!spaceId) return "No memory space configured.";
    const content = redactSecrets(text).trim();
    if (!content) return "No memory content provided.";

    await client.sources.ingest({
        space_id: spaceId,
        sources: [
            {
                content,
                content_type: "text",
                meta: {
                    source: "claude-code",
                    type: "manual_save",
                    project: basename(cwd),
                    repo: repoId(cwd),
                    branch: gitBranch(cwd) || undefined,
                },
            },
        ],
    });
    return "Saved to Crosmos memory.";
}
