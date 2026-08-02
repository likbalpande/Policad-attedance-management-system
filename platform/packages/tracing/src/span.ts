import { trace, SpanStatusCode, type Span } from "@opentelemetry/api";

const tracer = trace.getTracer("platform");

// Manual span helper - needed for anything without an auto-instrumentation
// package, most notably DB calls: the `postgres` driver (unlike `pg`) has no
// official OpenTelemetry instrumentation, so @platform/dal wraps each
// repository function with this instead of relying on auto-instrumentation.
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      // No explicit OK status on success - OTel convention is to leave
      // successful spans UNSET; OK is reserved for deliberately overriding
      // what would otherwise look like an error.
      return await fn(span);
    } catch (err) {
      span.recordException(err instanceof Error ? err : new Error(String(err)));
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      throw err;
    } finally {
      span.end();
    }
  });
}
