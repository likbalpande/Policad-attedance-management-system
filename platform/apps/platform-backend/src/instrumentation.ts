import { initTracing } from "@platform/tracing";
import { env } from "./config/env.config";

// This file is the real entrypoint (see package.json dev/build/start
// scripts) - never src/server.ts directly. initTracing() must run before
// express/http (or anything else covered by auto-instrumentations-node) is
// require()'d anywhere in the process, or instrumentation silently no-ops.
// A static `import "./server"` would get hoisted above this call by
// TypeScript/bundlers, so server.ts is loaded via a genuinely deferred
// dynamic import instead.
initTracing({
    service: env.OTEL_SERVICE_NAME,
    serviceNamespace: env.OTEL_SERVICE_NAMESPACE,
    deploymentEnvironment: env.OTEL_DEPLOYMENT_ENVIRONMENT,
    otlpEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
});

void import("./server");
