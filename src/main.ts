import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getClient } from "./lib/client.js";
import { debug } from "./lib/debug.js";
import { ingest } from "./memory/ingest.js";
import { recall } from "./memory/recall.js";
import { save } from "./memory/save.js";
import { search } from "./memory/search.js";
import { resolveSpaceId } from "./memory/space.js";

interface HookPayload {
    cwd?: string;
    transcript_path?: string;
    session_id?: string;
}

async function readPayload(): Promise<HookPayload> {
    try {
        const chunks: Buffer[] = [];
        for await (const c of process.stdin) chunks.push(c as Buffer);
        return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
        return {};
    }
}

function setup(key: string): void {
    const dir = join(homedir(), ".crosmos");
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const file = join(dir, "credentials.json");
    let creds: { api_key?: string } = {};
    try {
        creds = JSON.parse(readFileSync(file, "utf8"));
    } catch {}
    creds.api_key = key;
    writeFileSync(file, JSON.stringify(creds, null, 2), { mode: 0o600 });
    process.stdout.write("api key saved to ~/.crosmos/credentials.json\n");
}

async function status(): Promise<void> {
    const client = getClient();
    if (!client) {
        process.stdout.write("no api key — set CROSMOS_API_KEY or run /crosmos:setup <key>\n");
        return;
    }
    try {
        const spaceId = await resolveSpaceId(client);
        process.stdout.write(
            spaceId ? `connected — space ${spaceId}\n` : "api key found, no space found\n"
        );
    } catch (e) {
        debug("status error", e);
        process.stdout.write("api key set, but the api is unreachable\n");
    }
}

async function main(): Promise<void> {
    const [cmd, ...rest] = process.argv.slice(2);

    if (cmd === "setup") {
        if (rest[0]) setup(rest[0]);
        else process.stderr.write("usage: crosmos setup <api-key>\n");
        return;
    }
    if (cmd === "status") return status();

    const client = getClient();
    if (!client) {
        debug(cmd, "skipped: no api key");
        return;
    }

    if (cmd === "recall") {
        const p = await readPayload();
        const out = await recall(client, p.cwd || process.cwd());
        if (out) process.stdout.write(out);
        return;
    }
    if (cmd === "ingest") {
        const p = await readPayload();
        if (p.transcript_path && p.session_id) {
            await ingest(client, {
                transcriptPath: p.transcript_path,
                sessionId: p.session_id,
                cwd: p.cwd || process.cwd(),
            });
        }
        return;
    }
    if (cmd === "search") return void process.stdout.write(await search(client, rest.join(" ")));
    if (cmd === "save")
        return void process.stdout.write(await save(client, rest.join(" "), process.cwd()));
}

main().catch((e) => {
    debug("fatal", e);
    process.exit(0);
});
