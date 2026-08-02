import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  type SpanExporter,
  type SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { defaultResource, resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

export interface InitTracingOptions {
  service: string;
  // Falls back to a ConsoleSpanExporter (prints spans to stdout) when unset -
  // works with zero extra infra today. Point this at any OTLP-compatible
  // collector or backend (self-hosted Jaeger/Tempo, Honeycomb, Grafana Cloud,
  // Datadog, ...) once one is stood up - no code change needed either way.
  otlpEndpoint?: string;
  // "batch" (default) buffers spans and flushes on a timer - fine for a
  // long-running server (PB). "simple" flushes every span synchronously as
  // it ends - REQUIRED for anything per-invocation (LALW's Lambda handler):
  // the execution environment freezes between invocations, so a timer-based
  // batch flush may never fire and spans get silently dropped.
  spanProcessorMode?: "batch" | "simple";
}

// getNodeAutoInstrumentations() loads 39 instrumentation packages by default
// (mongodb, redis, graphql, grpc, kafka, mysql, oracledb, hapi, koa,
// socket.io, ...) covering libraries nothing in this monorepo uses - real
// cost in startup time and bundle size (matters most for LALW's future
// Lambda cold start). Explicitly disabled below; only instrumentations we
// actually use or will imminently use (LAG/LALW's SQS + Lambda handler, and
// undici for future outbound fetch calls e.g. webhook dispatch) stay on.
const DISABLED_AUTO_INSTRUMENTATIONS = [
  "amqplib",
  "bunyan",
  "cassandra-driver",
  "connect",
  "cucumber",
  "dataloader",
  "dns",
  "generic-pool",
  "graphql",
  "grpc",
  "hapi",
  "ioredis",
  "kafkajs",
  "knex",
  "koa",
  "lru-memoizer",
  "memcached",
  "mongodb",
  "mongoose",
  "mysql2",
  "mysql",
  "nestjs-core",
  "net",
  "openai",
  "oracledb",
  // We use the `postgres` driver, not `pg` - this one instruments the wrong
  // client entirely and would silently do nothing anyway.
  "pg",
  "pino",
  "redis",
  "restify",
  "router",
  "runtime-node",
  "socket.io",
  "tedious",
] as const;

// MUST be called before any other module in this process require()s express,
// http, winston, or anything else auto-instrumentations-node covers.
// OpenTelemetry patches modules at require() time, so instrumenting after
// the target module is already loaded is a silent no-op (no error, spans
// just never appear, log correlation just never happens). Call this from a
// dedicated entrypoint file (e.g. src/instrumentation.ts) that requires the
// real app only afterward - never from a file that itself gets imported as
// part of the normal app graph, since bundlers/ESM hoist imports above any
// runtime code in that file.
export function initTracing(options: InitTracingOptions): NodeSDK {
  const exporter: SpanExporter = options.otlpEndpoint
    ? new OTLPTraceExporter({ url: options.otlpEndpoint })
    : new ConsoleSpanExporter();

  const spanProcessor: SpanProcessor =
    options.spanProcessorMode === "simple"
      ? new SimpleSpanProcessor(exporter)
      : new BatchSpanProcessor(exporter);

  const sdk = new NodeSDK({
    resource: defaultResource().merge(
      resourceFromAttributes({ [ATTR_SERVICE_NAME]: options.service }),
    ),
    spanProcessors: [spanProcessor],
    instrumentations: [
      getNodeAutoInstrumentations(
        Object.fromEntries(
          DISABLED_AUTO_INSTRUMENTATIONS.map((name) => [
            `@opentelemetry/instrumentation-${name}`,
            { enabled: false },
          ]),
        ),
      ),
    ],
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk.shutdown().catch(() => undefined);
  });

  return sdk;
}
