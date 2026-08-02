import { pgTable, serial, integer, timestamp, index } from "drizzle-orm/pg-core";
import { courseSessions } from "./course-sessions";
import { users } from "./users";
import { createdAtOnly } from "./timestamps";

export const attendanceSessionInvocations = pgTable(
  "attendance_session_invocations",
  {
    id: serial("id").primaryKey(),
    courseSessionId: integer("course_session_id")
      .notNull()
      .references(() => courseSessions.id),
    invokedByUserId: integer("invoked_by_user_id")
      .notNull()
      .references(() => users.id),
    invocationStartTimestamp: timestamp("invocation_start_timestamp", {
      withTimezone: true,
    }).notNull(),
    ...createdAtOnly(),
  },
  (table) => ({
    courseSessionIdIdx: index("idx__attendance_session_invocations__course_session_id").on(
      table.courseSessionId,
    ),
  }),
);
