import { basename } from "node:path";
import type Crosmos from "crosmos";
import { debug } from "../lib/debug.js";
import { gitBranch, recentCommitSubjects, repoId } from "../lib/git.js";
import { resolveSpaceId } from "./space.js";

const LIMIT = 6;
const RECENCY_BIAS = 0.6;
const MAX_MEMORY_CHARS = 500;
const MAX_CONTEXT_CHARS = 3500;

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

    const lines = capContext(
        candidates.map((c) => `- ${truncate(c.content.trim(), MAX_MEMORY_CHARS)}`)
    );
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
    const commits = recentCommitSubjects(cwd, 3).slice(0, 3);
    const parts = [
        "recent work, decisions, conventions, and preferences",
        `${project} project`,
        repoId(cwd),
        topic,
        ...commits,
    ].filter(Boolean);
    return parts.join(" ").slice(0, 500);
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

function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 15).trimEnd()}... [truncated]`;
}

function capContext(lines: string[]): string {
    let out = "";
    for (const line of lines) {
        const next = out ? `${out}\n${line}` : line;
        if (next.length > MAX_CONTEXT_CHARS) {
            return `${out}\n- ... [more memories omitted]`.trim();
        }
        out = next;
    }
    return out;
}
