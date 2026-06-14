import { appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const enabled = !!process.env.CROSMOS_DEBUG && process.env.CROSMOS_DEBUG !== "0";

export function debug(...parts: unknown[]): void {
    if (!enabled) return;
    try {
        const line = `${new Date().toISOString()} ${parts.map(String).join(" ")}\n`;
        appendFileSync(join(tmpdir(), "crosmos-claude.log"), line);
    } catch {}
}
