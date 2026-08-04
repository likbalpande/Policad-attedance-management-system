import { pgTable, serial, integer, varchar, unique, foreignKey } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { adminPermissionsConfigGroups } from "./admin-permissions-config-groups";
import { adminAccessIdentifiers } from "./access-identifiers";
import { createdAtOnly } from "./timestamps";

// Single source of truth for this table's constraint names - see the note
// in organizations.ts.
export const ADMIN_PERMITTED_ACCESS_IDENTIFIERS_CONSTRAINTS = {
    UQ_GROUP_ACCESS_IDENTIFIER:
        "uq__admin_permitted_access_identifiers__permission_config_group_id__access_identifier_id",
} as const;

export const adminPermittedAccessIdentifiers = pgTable(
    "admin_permitted_access_identifiers",
    {
        id: serial("id").primaryKey(),
        permissionConfigGroupId: integer("permission_config_group_id").notNull(),
        accessIdentifierId: integer("access_identifier_id").notNull(),
        // application_level_enum(general, batch, course, org) - denormalized,
        // must match both parents' type (enforced by the composite FKs below)
        type: varchar("type", { length: 25 }).$type<PermissionScope>().notNull(),
        ...createdAtOnly(),
    },
    (table) => ({
        fkConfigGroupType: foreignKey({
            name: "fk__admin_permitted_access_identifiers__permission_config_group_id__type",
            columns: [table.permissionConfigGroupId, table.type],
            foreignColumns: [adminPermissionsConfigGroups.id, adminPermissionsConfigGroups.type],
        }),
        fkAccessIdentifierType: foreignKey({
            name: "fk__admin_permitted_access_identifiers__access_identifier_id__type",
            columns: [table.accessIdentifierId, table.type],
            foreignColumns: [adminAccessIdentifiers.id, adminAccessIdentifiers.type],
        }),
        uqGroupIdentifier: unique(
            ADMIN_PERMITTED_ACCESS_IDENTIFIERS_CONSTRAINTS.UQ_GROUP_ACCESS_IDENTIFIER
        ).on(table.permissionConfigGroupId, table.accessIdentifierId),
    })
);
