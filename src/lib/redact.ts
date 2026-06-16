const SECRET_PATTERNS: RegExp[] = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/gi,
    /\b(csk|sk|pk)_[A-Za-z0-9._-]{16,}\b/g,
    /\b[A-Za-z0-9._%+-]+:(?:[A-Za-z0-9._~+/=-]{20,})@/g,
    /\b([A-Z0-9_]*(?:API[_-]?KEY|TOKEN|SECRET|PASSWORD|PASSWD)[A-Z0-9_]*)\s*=\s*["']?[^"'\s]{8,}["']?/gi,
];

export function redactSecrets(text: string): string {
    return SECRET_PATTERNS.reduce(
        (redacted, pattern) => redacted.replace(pattern, "[REDACTED_SECRET]"),
        text
    );
}
