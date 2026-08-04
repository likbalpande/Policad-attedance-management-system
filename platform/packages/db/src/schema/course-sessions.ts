import { pgTable, serial, varchar, text, integer, boolean, unique } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { users } from "./users";
import { timestamps } from "./timestamps";

// Single source of truth for this table's constraint names - see the note
// in organizations.ts.
export const COURSE_SESSIONS_CONSTRAINTS = {
  UQ_TITLE_COURSE: "uq__course_sessions__title__course_id",
  UQ_COURSE_ALIAS: "uq__course_sessions__course_id__alias",
} as const;

export const courseSessions = pgTable(
  "course_sessions",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 50 }).notNull(),
    alias: text("alias"),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    isArchived: boolean("is_archived").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    ...timestamps(),
  },
  (table) => ({
    uqTitleCourse: unique(COURSE_SESSIONS_CONSTRAINTS.UQ_TITLE_COURSE)
      .on(table.title, table.courseId)
      .nullsNotDistinct(),
    uqCourseAlias: unique(COURSE_SESSIONS_CONSTRAINTS.UQ_COURSE_ALIAS)
      .on(table.courseId, table.alias)
      .nullsNotDistinct(),
  }),
);
