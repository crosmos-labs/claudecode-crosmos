import { execFileSync } from "node:child_process";

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
