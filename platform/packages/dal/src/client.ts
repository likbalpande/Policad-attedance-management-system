import { createDbClient, type DbClient, type DbClientOptions } from "@platform/db";

export type { DbClientOptions };

let dbClient: DbClient | undefined;
let closeClient: (() => Promise<void>) | undefined;

// Called once at process startup (PB's / LALW's server.ts). No app may create
// its own DB connection - this is the only place @platform/db's client factory
// is invoked. `options` is forwarded as-is; omit it to get a single-connection
// client (the safe default for per-invocation runtimes like LALW's Lambda).
export function initDal(databaseUrl: string, options?: DbClientOptions): void {
  if (dbClient) return;
  const { db, close } = createDbClient(databaseUrl, options);
  dbClient = db;
  closeClient = close;
}

export function getDb(): DbClient {
  if (!dbClient) {
    throw new Error("DAL not initialized - call initDal(databaseUrl) before any repository use");
  }
  return dbClient;
}

export async function closeDal(): Promise<void> {
  await closeClient?.();
  dbClient = undefined;
  closeClient = undefined;
}
