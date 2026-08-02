import { pgTable, serial, varchar, text, boolean, unique } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

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
        uqName: unique("uq__organizations__name").on(table.name),
    })
);
