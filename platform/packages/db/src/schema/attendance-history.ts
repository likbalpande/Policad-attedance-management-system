import { pgTable, serial, integer, varchar, jsonb, doublePrecision, timestamp, index } from "drizzle-orm/pg-core";
import type { AttendanceStatus, AttendanceRemark } from "@platform/enums";
import { users } from "./users";
import { courseSessions } from "./course-sessions";
import { geographyPoint } from "./custom-types";
import { createdAtOnly } from "./timestamps";

export const attendanceHistory = pgTable(
    "attendance_history",
    {
        id: serial("id").primaryKey(),
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        courseSessionId: integer("course_session_id")
            .notNull()
            .references(() => courseSessions.id),
        // application_level_enum(present, absent)
        status: varchar("status", { length: 50 }).$type<AttendanceStatus>().notNull(),
        // application_level_enum('qr based attendance', 'admin triggered')
        remark: varchar("remark", { length: 50 }).$type<AttendanceRemark>().notNull(),
        // nullable - null when status = absent
        deviceConfig: jsonb("device_config"),
        // nullable - null when status = absent
        ipAddress: varchar("ip_address", { length: 50 }),
        // TODO: location/geofencing not yet specified - see product-idea.txt
        locationInfo: jsonb("location_info"),
        locationLat: doublePrecision("location_lat"),
        locationLong: doublePrecision("location_long"),
        locationPoint: geographyPoint("location_point"),
        // nullable - null when status = absent
        scannedAt: timestamp("scanned_at", { withTimezone: true }),
        // nullable for system marked
        remarkedByUserId: integer("remarked_by_user_id").references(() => users.id),
        ...createdAtOnly(),
    },
    (table) => ({
        courseSessionIdIdx: index("idx__attendance_history__course_session_id").on(table.courseSessionId),
        userIdIdx: index("idx__attendance_history__user_id").on(table.userId),
    })
);
