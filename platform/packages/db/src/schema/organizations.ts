import { pgTable, serial, varchar, text, boolean, unique } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names and their
// user-facing conflict messages, paired together so one can't be added
// without the other. `.key` is used directly in the unique() calls below;
// the whole object is re-exported (via @platform/dal) for services to pass
// to @platform/http's assertNoUniqueViolation.
export const ORGANIZATIONS_CONSTRAINTS = {
    UQ_NAME: { key: "uq__organizations__name", message: "An organization with this name already exists" },
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
        uqName: unique(ORGANIZATIONS_CONSTRAINTS.UQ_NAME.key).on(table.name),
    })
);
