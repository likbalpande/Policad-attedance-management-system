import { pgTable, serial, varchar, text, unique } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { timestamps } from "./timestamps";

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
    uqTitleType: unique("uq__admin_permissions_config_groups__title__type").on(
      table.title,
      table.type,
    ),
    uqIdType: unique("uq__admin_permissions_config_groups__id__type").on(table.id, table.type),
  }),
);
