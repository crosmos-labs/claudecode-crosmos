import { basename } from "node:path";
import type Crosmos from "crosmos";
import { resolveSpaceId } from "./space.js";

export async function save(client: Crosmos, text: string, cwd: string): Promise<string> {
    const spaceId = await resolveSpaceId(client);
    if (!spaceId) return "No memory space configured.";

    await client.sources.ingest({
        space_id: spaceId,
        sources: [
            {
                content: text,
                content_type: "text",
                meta: { source: "claude-code", project: basename(cwd) },
            },
        ],
    });
    return "Saved to Crosmos memory.";
}
