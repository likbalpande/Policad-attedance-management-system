import { pgTable, serial, varchar, text, integer, boolean, unique } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { users } from "./users";
import { timestamps } from "./timestamps";

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
    uqTitleCourse: unique("uq__course_sessions__title__course_id")
      .on(table.title, table.courseId)
      .nullsNotDistinct(),
    uqCourseAlias: unique("uq__course_sessions__course_id__alias")
      .on(table.courseId, table.alias)
      .nullsNotDistinct(),
  }),
);
