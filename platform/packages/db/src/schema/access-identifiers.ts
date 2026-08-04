import { pgTable, serial, varchar, unique } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names and their
// user-facing conflict messages - see the note in organizations.ts.
export const ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS = {
    UQ_IDENTIFIER_TYPE: {
        key: "uq__admin_access_identifiers__identifier__type",
        message: "An access identifier with this identifier already exists for this type",
    },
    // (id, type) is only unique to support the composite FK from
    // admin_permitted_access_identifiers - id alone is already unique, so
    // this can't actually be violated in practice.
    UQ_ID_TYPE: {
        key: "uq__admin_access_identifiers__id__type",
        message: "This access identifier already exists for this type",
    },
} as const;

export const adminAccessIdentifiers = pgTable(
    "admin_access_identifiers",
    {
        id: serial("id").primaryKey(),
        identifier: varchar("identifier", { length: 50 }).notNull(),
        description: varchar("description", { length: 50 }).notNull(),
        // application_level_enum(general, batch, course, org)
        type: varchar("type", { length: 25 }).$type<PermissionScope>().notNull(),
        ...timestamps(),
    },
    (table) => ({
        uqIdentifierType: unique(ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS.UQ_IDENTIFIER_TYPE.key).on(
            table.identifier,
            table.type
        ),
        uqIdType: unique(ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS.UQ_ID_TYPE.key).on(table.id, table.type),
    })
);
