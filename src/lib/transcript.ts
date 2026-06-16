import { readFileSync } from "node:fs";
import { redactSecrets } from "./redact.js";

export interface Turn {
    role: "user" | "assistant";
    content: string;
}

const MAX_CHARS = 1500;
const MAX_TURNS = 30;

export function readTurns(path: string, sinceLine = 0): { turns: Turn[]; lastLine: number } {
    let text: string;
    try {
        text = readFileSync(path, "utf8");
    } catch {
        return { turns: [], lastLine: sinceLine };
    }

    const lines = text.split("\n");
    const lastLine = text.endsWith("\n") ? lines.length - 1 : lines.length;

    const turns: Turn[] = [];
    for (let i = sinceLine; i < lines.length; i++) {
        const raw = lines[i]?.trim();
        if (!raw) continue;
        let entry: { type?: string; message?: { content?: unknown } };
        try {
            entry = JSON.parse(raw);
        } catch {
            continue;
        }
        if (entry?.type !== "user" && entry?.type !== "assistant") continue;
        const content = extractText(entry.message?.content);
        if (content)
            turns.push({ role: entry.type, content: redactSecrets(content).slice(0, MAX_CHARS) });
    }

    return { turns: turns.slice(-MAX_TURNS), lastLine };
}

function extractText(content: unknown): string {
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
        return content
            .filter((b) => b?.type === "text" && typeof b.text === "string")
            .map((b) => b.text)
            .join("\n")
            .trim();
    }
    return "";
}
