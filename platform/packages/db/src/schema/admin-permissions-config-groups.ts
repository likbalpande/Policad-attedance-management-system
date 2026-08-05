import { pgTable, serial, varchar, text, unique, index } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names and their
// user-facing conflict messages - see the note in organizations.ts.
export const ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS = {
  UQ_TITLE_TYPE: {
    key: "uq__admin_permissions_config_groups__title__type",
    message: "A permissions config group with this title already exists for this type",
  },
  // (id, type) is only unique to support the composite FK from
  // user_permissions - id alone is already unique, so this can't actually
  // be violated in practice.
  UQ_ID_TYPE: {
    key: "uq__admin_permissions_config_groups__id__type",
    message: "This permissions config group already exists for this type",
  },
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
    uqTitleType: unique(ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS.UQ_TITLE_TYPE.key).on(
      table.title,
      table.type,
    ),
    uqIdType: unique(ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS.UQ_ID_TYPE.key).on(table.id, table.type),
    idxType: index("idx__admin_permissions_config_groups__type").on(table.type),
  }),
);
