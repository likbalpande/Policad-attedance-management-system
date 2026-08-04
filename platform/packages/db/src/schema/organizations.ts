import { pgTable, serial, varchar, text, boolean, unique } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names - used here in
// the schema definition itself and re-exported (via @platform/dal) for
// services to match against caught unique-violation errors, so the two
// never drift apart.
export const ORGANIZATIONS_CONSTRAINTS = {
    UQ_NAME: "uq__organizations__name",
} as const;

export const organizations = pgTable(
    "organizations",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 100 }).notNull(),
        logoUrl: text("logo_url"),
        webhookUrl: text("webhook_url"),
        hasLiveAttendanceTrigger: boolean("has_live_attendance_trigger").default(false).notNull(),
        isDeleted: boolean("is_deleted").default(false).notNull(),
        ...timestamps(),
    },
    (table) => ({
        uqName: unique(ORGANIZATIONS_CONSTRAINTS.UQ_NAME).on(table.name),
    })
);
