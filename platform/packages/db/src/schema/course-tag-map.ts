import { pgTable, serial, integer, unique, index } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { courseTags } from "./course-tags";
import { users } from "./users";
import { createdAtOnly } from "./timestamps";

// Single source of truth for this table's constraint names - see the note
// in organizations.ts.
export const COURSE_TAG_MAP_CONSTRAINTS = {
  UQ_COURSE_TAG: "uq__course_tag_map__course_id__course_tag_id",
} as const;

export const courseTagMap = pgTable(
  "course_tag_map",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    courseTagId: integer("course_tag_id")
      .notNull()
      .references(() => courseTags.id),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    ...createdAtOnly(),
  },
  (table) => ({
    uqCourseTag: unique(COURSE_TAG_MAP_CONSTRAINTS.UQ_COURSE_TAG)
      .on(table.courseId, table.courseTagId)
      .nullsNotDistinct(),
    courseTagIdIdx: index("idx__course_tag_map__course_tag_id").on(table.courseTagId),
  }),
);
