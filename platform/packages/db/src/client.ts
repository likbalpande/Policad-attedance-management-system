import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export type DbClient = PostgresJsDatabase<typeof schema>;

export interface DbClientOptions {
  // Max connections in the pool. Defaults to 1 (no real pooling) - safe for
  // any per-invocation runtime (e.g. LALW's Lambda handler, where each
  // concurrent invocation is a separate process and a wide pool per
  // invocation would multiply connections against Postgres's connection
  // limit). Long-running servers that actually benefit from pooling (PB)
  // must opt in explicitly with a higher value.
  max?: number;
  idleTimeoutSeconds?: number;
  connectTimeoutSeconds?: number;
}

export function createDbClient(
  databaseUrl: string,
  options: DbClientOptions = {},
): { db: DbClient; close: () => Promise<void> } {
  const queryClient = postgres(databaseUrl, {
    max: options.max ?? 1,
    idle_timeout: options.idleTimeoutSeconds,
    connect_timeout: options.connectTimeoutSeconds,
  });
  const db = drizzle(queryClient, { schema });
  return { db, close: () => queryClient.end() };
}
