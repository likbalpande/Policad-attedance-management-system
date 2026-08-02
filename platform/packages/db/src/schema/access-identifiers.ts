import { pgTable, serial, varchar, unique } from "drizzle-orm/pg-core";
import type { PermissionScope } from "@platform/permissions";
import { timestamps } from "./timestamps";

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
        uqIdentifierType: unique("uq__admin_access_identifiers__identifier__type").on(table.identifier, table.type),
        uqIdType: unique("uq__admin_access_identifiers__id__type").on(table.id, table.type),
    })
);
