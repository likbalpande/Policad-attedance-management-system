import { pgTable, serial, varchar, text, integer, boolean, unique } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";
import { timestamps } from "./timestamps";

export const batches = pgTable(
  "batches",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 50 }).notNull(),
    alias: text("alias"),
    orgId: integer("org_id")
      .notNull()
      .references(() => organizations.id),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    isArchived: boolean("is_archived").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    ...timestamps(),
  },
  (table) => ({
    uqTitleOrg: unique("uq__batches__title__org_id")
      .on(table.title, table.orgId)
      .nullsNotDistinct(),
    uqAliasOrg: unique("uq__batches__alias__org_id")
      .on(table.orgId, table.alias)
      .nullsNotDistinct(),
  }),
);
