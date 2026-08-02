import { pgTable, serial, integer, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const orgDailySecrets = pgTable(
  "org_daily_secrets",
  {
    id: serial("id").primaryKey(),
    orgId: integer("org_id")
      .notNull()
      .references(() => organizations.id),
    secret: varchar("secret", { length: 255 }).notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    orgGeneratedAtIdx: index("idx__org_daily_secrets__org_id__generated_at").on(
      table.orgId,
      table.generatedAt,
    ),
  }),
);
