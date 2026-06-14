import { basename } from "node:path";
import type Crosmos from "crosmos";
import { debug } from "../lib/debug.js";
import { gitBranch } from "../lib/git.js";
import { resolveSpaceId } from "./space.js";

const LIMIT = 6;
const RECENCY_BIAS = 0.6;

export async function recall(client: Crosmos, cwd: string): Promise<string> {
    const spaceId = await resolveSpaceId(client);
    if (!spaceId) {
        debug("recall: no space");
        return "";
    }

    const query = buildQuery(cwd);
    const { candidates } = await client.search.hybrid({
        space_id: spaceId,
        query,
        limit: LIMIT,
        recency_bias: RECENCY_BIAS,
        diversify: true,
        include_source: false,
    });
    debug("recall:", `query="${query}"`, `hits=${candidates?.length ?? 0}`);
    if (!candidates?.length) return "";

    const lines = candidates.map((c) => `- ${c.content.trim()}`).join("\n");
    return [
        "<crosmos-memory>",
        "Recalled context from past sessions. Reference it only when relevant — including indirect connections — but don't force it into your response or assume beyond what's stated.",
        "",
        lines,
        "</crosmos-memory>",
    ].join("\n");
}

function buildQuery(cwd: string): string {
    const project = basename(cwd);
    const topic = branchTopic(cwd);
    const focus = topic ? ` ${topic}` : "";
    return `recent work, decisions, and preferences for the ${project} project${focus}`;
}

// Turn a feature-branch slug into query words (drop main/master, prefixes like
// `feature/`, and pure-noise branches with no real word).
function branchTopic(cwd: string): string {
    const branch = gitBranch(cwd);
    if (!branch || branch === "main" || branch === "master") return "";
    const words = branch
        .replace(/^[^/]+\//, "")
        .replace(/[-_/]+/g, " ")
        .trim();
    return /[a-z]{3,}/i.test(words) ? words : "";
}
