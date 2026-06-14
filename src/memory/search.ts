import type Crosmos from "crosmos";
import { resolveSpaceId } from "./space.js";

export async function search(client: Crosmos, query: string): Promise<string> {
    const spaceId = await resolveSpaceId(client);
    if (!spaceId) return "No memory space configured.";

    const { candidates } = await client.search.hybrid({
        space_id: spaceId,
        query,
        limit: 10,
        include_source: true,
    });
    if (!candidates?.length) return "No relevant memories found.";

    return candidates.map((c, i) => `${i + 1}. ${c.content.trim()}`).join("\n\n");
}
