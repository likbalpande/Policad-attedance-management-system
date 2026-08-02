import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { WebhookStatus } from "@platform/enums";
import { attendanceHistory } from "./attendance-history";
import { timestamps } from "./timestamps";

export const webhookHistory = pgTable(
  "webhook_history",
  {
    id: serial("id").primaryKey(),
    attendanceHistoryId: integer("attendance_history_id")
      .notNull()
      .references(() => attendanceHistory.id),
    // application_level_enum(pending, completed)
    status: varchar("status", { length: 50 }).$type<WebhookStatus>().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    lastAttemptedAt: timestamp("last_attempted_at", { withTimezone: true }),
    processingStartedAt: timestamp("processing_started_at", { withTimezone: true }),
    isProcessing: boolean("is_processing").default(false).notNull(),
    retries: integer("retries").default(0),
    webhookUrl: text("webhook_url").notNull(),
    ...timestamps(),
  },
  (table) => ({
    // Partial indexes below only cover rows still in flight (status != 'completed').
    // NOTE: verify exact .using()/.where() chaining against the pinned drizzle-kit
    // version on first `db:generate` run - syntax has shifted across drizzle-orm minors.
    statusIdx: index("idx__webhook_history__status")
      .on(table.status)
      .where(sql`${table.status} != 'completed'`),
    updatedAtIdx: index("idx__webhook_history__updated_at")
      .on(table.updatedAt)
      .where(sql`${table.status} != 'completed'`),
    processingStartedAtIdx: index("idx__webhook_history__processing_started_at")
      .using("brin", table.processingStartedAt)
      .where(sql`${table.status} != 'completed'`),
    retriesIdx: index("idx__webhook_history__retries")
      .on(table.retries)
      .where(sql`${table.status} != 'completed'`),
  }),
);
