import { pgTable, serial, integer, varchar, unique, foreignKey } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { users } from "./users";
import { adminPermissionsConfigGroups } from "./admin-permissions-config-groups";
import { createdAtOnly } from "./timestamps";

// Single source of truth for this table's constraint names - see the note
// in organizations.ts.
export const USER_PERMISSIONS_CONSTRAINTS = {
  UQ_USER_GROUP_RESOURCE:
    "uq__user_permissions__user_id__admin_permissions_config_group_id__resource_id",
} as const;

export const userPermissions = pgTable(
  "user_permissions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    adminPermissionsConfigGroupId: integer("admin_permissions_config_group_id").notNull(),
    // batch_id / course_id / org_id / null, depending on the config group's type
    resourceId: integer("resource_id"),
    // application_level_enum(general, batch, course, org) - denormalized,
    // must match the parent config group's type (enforced by the composite FK below)
    resourceType: varchar("resource_type", { length: 25 }).$type<PermissionScope>().notNull(),
    assignedByUserId: integer("assigned_by_user_id")
      .notNull()
      .references(() => users.id),
    ...createdAtOnly(),
  },
  (table) => ({
    fkConfigGroupResourceType: foreignKey({
      name: "fk__user_permissions__admin_permissions_config_group_id__resource_type",
      columns: [table.adminPermissionsConfigGroupId, table.resourceType],
      foreignColumns: [adminPermissionsConfigGroups.id, adminPermissionsConfigGroups.type],
    }),
    uqUserGroupResource: unique(USER_PERMISSIONS_CONSTRAINTS.UQ_USER_GROUP_RESOURCE)
      .on(table.userId, table.adminPermissionsConfigGroupId, table.resourceId)
      .nullsNotDistinct(),
  }),
);
