import { initDal } from "@platform/dal";
import { createApp } from "./app";
import { env } from "./config/env.config";
import { logger } from "./logger";

// PB is a long-running server, so unlike LALW (per-invocation, must stay at
// the @platform/db default of 1 connection) it opts into a real pool.
const DB_POOL_MAX = 10;

async function bootstrap(): Promise<void> {
  initDal(env.DATABASE_URL, { max: DB_POOL_MAX });

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`platform-backend listening on port ${env.PORT} (${env.APP_ENV})`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start platform-backend", { error: err });
  process.exit(1);
});
