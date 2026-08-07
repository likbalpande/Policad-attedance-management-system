import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 5173
  },
  optimizeDeps: {
    // Workspace packages (@platform/*) build to CJS via tsup. Symlinked
    // packages consumed via /@fs/ skip Vite's CJS->ESM named-export interop
    // unless they're forced through the esbuild pre-bundler here - without
    // this, `import { USER_ROLE } from "@platform/permissions"` fails at
    // runtime with "does not provide an export named 'USER_ROLE'".
    include: ["@platform/permissions", "@platform/types", "@platform/uai"]
  }
});
