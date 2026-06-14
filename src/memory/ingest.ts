import { basename } from "node:path";
import type Crosmos from "crosmos";
import { readStore, writeStore } from "../lib/config.js";
import { debug } from "../lib/debug.js";
import { readTurns } from "../lib/transcript.js";
import { resolveSpaceId } from "./space.js";

export async function ingest(
    client: Crosmos,
    opts: { transcriptPath: string; sessionId: string; cwd: string }
): Promise<void> {
    const store = readStore();
    const sinceLine = store.lastLine?.[opts.sessionId] ?? 0;
    const { turns, lastLine } = readTurns(opts.transcriptPath, sinceLine);

    const advance = () =>
        writeStore({ ...store, lastLine: { ...store.lastLine, [opts.sessionId]: lastLine } });

    const substantial = turns.some((t) => t.content.split(/\s+/).length >= 4);
    if (!substantial) {
        debug("ingest: nothing substantial since line", sinceLine);
        advance();
        return;
    }

    const spaceId = await resolveSpaceId(client);
    if (!spaceId) {
        debug("ingest: no space");
        return;
    }

    const res = await client.conversations.ingest({
        space_id: spaceId,
        session_id: opts.sessionId,
        session_date: new Date().toISOString(),
        messages: turns.map((t) => ({ role: t.role, content: t.content })),
        meta: { source: "claude-code", project: basename(opts.cwd) },
    });
    debug("ingest:", `turns=${turns.length}`, JSON.stringify(res));
    advance();
}
