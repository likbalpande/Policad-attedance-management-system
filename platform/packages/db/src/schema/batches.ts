import { pgTable, serial, varchar, text, integer, boolean, unique, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names and their
// user-facing conflict messages - see the note in organizations.ts.
export const BATCHES_CONSTRAINTS = {
  UQ_TITLE_ORG: {
    key: "uq__batches__title__org_id",
    message: "A batch with this title already exists in this organization",
  },
  UQ_ALIAS_ORG: {
    key: "uq__batches__alias__org_id",
    message: "A batch with this alias already exists in this organization",
  },
} as const;

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
    uqTitleOrg: unique(BATCHES_CONSTRAINTS.UQ_TITLE_ORG.key)
      .on(table.title, table.orgId)
      .nullsNotDistinct(),
    uqAliasOrg: unique(BATCHES_CONSTRAINTS.UQ_ALIAS_ORG.key)
      .on(table.orgId, table.alias)
      .nullsNotDistinct(),
    orgIdIsDeletedIdx: index("idx__batches__org_id__is_deleted").on(table.orgId, table.isDeleted),
    // No separate index on [id, orgId] - id is already the PK, so
    // WHERE id = ? AND orgId = ? resolves to one row via the PK alone;
    // orgId there is a post-filter check on that single row, not a
    // discriminator that needs its own index.
  }),
);
