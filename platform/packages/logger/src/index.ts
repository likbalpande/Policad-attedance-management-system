import winston from "winston";

export type Logger = winston.Logger;

// trace_id/span_id correlation is NOT done here - @opentelemetry/instrumentation-winston
// (loaded by @platform/tracing's initTracing() via getNodeAutoInstrumentations)
// already patches winston to inject trace_id/span_id/trace_flags into every
// log call made inside an active span, with zero code on our side. Verified
// empirically. This only works if winston is require()'d after initTracing()
// runs (same init-order rule as express/http - see @platform/tracing), which
// holds here since this package is only ever loaded transitively from an
// app's dedicated instrumentation.ts entrypoint.
export function createLogger({ service }: { service: string }): Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL ?? "info",
    defaultMeta: { service },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [new winston.transports.Console()],
  });
}
