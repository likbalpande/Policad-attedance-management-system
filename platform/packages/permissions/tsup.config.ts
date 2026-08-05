import { defineConfig } from "tsup";

// tsup has no declaration-map (.d.ts.map) support (checked its DtsConfig
// type - no sourcemap option exists there), so "Go to Definition" landing on
// real src/*.ts is handled separately via @platform/tsconfig/base.json's
// `paths` mapping, not via this build. sourcemap here is purely for the JS
// output: on for local dev (readable stack traces without extra tooling),
// off for production (leaner deploy artifact, no source exposed).
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: true,
  sourcemap: !isProduction,
  clean: true,
});
