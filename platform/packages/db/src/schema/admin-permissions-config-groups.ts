import { pgTable, serial, varchar, text, unique } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names - see the note
// in organizations.ts.
export const ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS = {
  UQ_TITLE_TYPE: "uq__admin_permissions_config_groups__title__type",
  UQ_ID_TYPE: "uq__admin_permissions_config_groups__id__type",
} as const;

export const adminPermissionsConfigGroups = pgTable(
  "admin_permissions_config_groups",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 50 }).notNull(),
    description: text("description").notNull(),
    // application_level_enum(general, batch, course, org)
    type: varchar("type", { length: 25 }).$type<PermissionScope>().notNull(),
    ...timestamps(),
  },
  (table) => ({
    uqTitleType: unique(ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS.UQ_TITLE_TYPE).on(
      table.title,
      table.type,
    ),
    uqIdType: unique(ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS.UQ_ID_TYPE).on(table.id, table.type),
  }),
);
