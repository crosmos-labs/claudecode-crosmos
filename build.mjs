import { build } from "esbuild";

await build({
    entryPoints: ["src/main.ts"],
    outfile: "plugin/scripts/crosmos.cjs",
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node18",
    banner: { js: "#!/usr/bin/env node" },
});

console.log("built plugin/scripts/crosmos.cjs");
