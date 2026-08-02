import { context, propagation, type Context } from "@opentelemetry/api";

// For propagating trace context across the SQS boundary (LAG publishes,
// LALW consumes) once those apps exist - not wired into anything yet, but
// the primitives are ready: LAG calls injectTraceContext() into the SQS
// message attributes it sends, LALW calls extractTraceContext() on receipt
// and runs its processing inside that extracted context so the whole
// LAG -> SQS -> LALW -> PB webhook flow shows up as one trace.
export function injectTraceContext(carrier: Record<string, string>): void {
  propagation.inject(context.active(), carrier);
}

export function extractTraceContext(carrier: Record<string, string>): Context {
  return propagation.extract(context.active(), carrier);
}
