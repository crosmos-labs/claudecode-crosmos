import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Store {
    spaceId?: string;
    lastLine?: Record<string, number>;
}

function dataDir(): string {
    return process.env.CLAUDE_PLUGIN_DATA || join(homedir(), ".crosmos");
}

function storePath(): string {
    return join(dataDir(), "store.json");
}

export function readStore(): Store {
    try {
        return JSON.parse(readFileSync(storePath(), "utf8"));
    } catch {
        return {};
    }
}

export function writeStore(store: Store): void {
    mkdirSync(dataDir(), { recursive: true });
    writeFileSync(storePath(), JSON.stringify(store, null, 2));
}
