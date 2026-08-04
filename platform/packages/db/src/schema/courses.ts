import { pgTable, serial, varchar, text, integer, boolean, unique } from "drizzle-orm/pg-core";
import type { CourseType } from "@platform/enums";
import { organizations } from "./organizations";
import { users } from "./users";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names and their
// user-facing conflict messages - see the note in organizations.ts.
export const COURSES_CONSTRAINTS = {
  UQ_TITLE_ORG: {
    key: "uq__courses__title__org_id",
    message: "A course with this title already exists in this organization",
  },
  UQ_ALIAS_ORG: {
    key: "uq__courses__alias__org_id",
    message: "A course with this alias already exists in this organization",
  },
} as const;

export const courses = pgTable(
  "courses",
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
    // application_level_enum(regular, event)
    type: varchar("type", { length: 25 }).$type<CourseType>().notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    ...timestamps(),
  },
  (table) => ({
    uqTitleOrg: unique(COURSES_CONSTRAINTS.UQ_TITLE_ORG.key)
      .on(table.title, table.orgId)
      .nullsNotDistinct(),
    uqAliasOrg: unique(COURSES_CONSTRAINTS.UQ_ALIAS_ORG.key)
      .on(table.orgId, table.alias)
      .nullsNotDistinct(),
  }),
);
