import { execFileSync } from "node:child_process";
import { basename } from "node:path";

export function gitBranch(cwd: string): string {
    try {
        return execFileSync("git", ["branch", "--show-current"], {
            cwd,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 1000,
        }).trim();
    } catch {
        return "";
    }
}

export function gitRemote(cwd: string): string {
    try {
        return execFileSync("git", ["remote", "get-url", "origin"], {
            cwd,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 1000,
        }).trim();
    } catch {
        return "";
    }
}

export function recentCommitSubjects(cwd: string, limit = 3): string[] {
    try {
        const out = execFileSync("git", ["log", `-${limit}`, "--format=%s"], {
            cwd,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 1000,
        }).trim();
        return out
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
    } catch {
        return [];
    }
}

export function repoId(cwd: string): string {
    const remote = gitRemote(cwd);
    if (remote) {
        return remote
            .replace(/^(https?:\/\/|git@|ssh:\/\/)/, "")
            .replace(/^[^/]+@(?=[^/]+\/)/, "")
            .replace(/\.git$/, "")
            .replace(/:/g, "/")
            .replace(/[^a-zA-Z0-9/_-]/g, "-")
            .toLowerCase();
    }
    return basename(cwd);
}
