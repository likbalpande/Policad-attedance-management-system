import { pgTable, serial, varchar, unique } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names - see the note
// in organizations.ts.
export const ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS = {
    UQ_IDENTIFIER_TYPE: "uq__admin_access_identifiers__identifier__type",
    UQ_ID_TYPE: "uq__admin_access_identifiers__id__type",
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
        uqIdentifierType: unique(ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS.UQ_IDENTIFIER_TYPE).on(
            table.identifier,
            table.type
        ),
        uqIdType: unique(ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS.UQ_ID_TYPE).on(table.id, table.type),
    })
);
