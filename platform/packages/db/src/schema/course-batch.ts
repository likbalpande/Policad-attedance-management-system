import { pgTable, serial, integer, unique, index } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { batches } from "./batches";
import { users } from "./users";
import { createdAtOnly } from "./timestamps";

// Single source of truth for this table's constraint names - see the note
// in organizations.ts.
export const COURSE_BATCH_CONSTRAINTS = {
  UQ_COURSE_BATCH: "uq__course_batch__course_id__batch_id",
} as const;

export const courseBatch = pgTable(
  "course_batch",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id),
    assignedByUserId: integer("assigned_by_user_id")
      .notNull()
      .references(() => users.id),
    ...createdAtOnly(),
  },
  (table) => ({
    uqCourseBatch: unique(COURSE_BATCH_CONSTRAINTS.UQ_COURSE_BATCH)
      .on(table.courseId, table.batchId)
      .nullsNotDistinct(),
    batchIdIdx: index("idx__course_batch__batch_id").on(table.batchId),
  }),
);
