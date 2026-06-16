import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import Crosmos from "crosmos";

const credentialsPath = join(homedir(), ".crosmos", "credentials.json");

function readCredentials(): { api_key?: string; base_url?: string } {
    try {
        return JSON.parse(readFileSync(credentialsPath, "utf8"));
    } catch {
        return {};
    }
}

export function getApiKey(): string | undefined {
    return process.env.CROSMOS_API_KEY || readCredentials().api_key;
}

export function getClient(): Crosmos | null {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    const baseURL = process.env.CROSMOS_API_BASE_URL || readCredentials().base_url;
    return new Crosmos(baseURL ? { apiKey, baseURL } : { apiKey });
}
