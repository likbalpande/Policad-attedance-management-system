import { pgTable, serial, integer, unique, index } from "drizzle-orm/pg-core";
import { batches } from "./batches";
import { users } from "./users";
import { createdAtOnly } from "./timestamps";

// Single source of truth for this table's constraint names and their
// user-facing conflict messages - see the note in organizations.ts.
export const BATCH_STUDENTS_CONSTRAINTS = {
  UQ_BATCH_USER: {
    key: "uq__batch_students__batch_id__user_id",
    message: "This student is already enrolled in this batch",
  },
} as const;

export const batchStudents = pgTable(
  "batch_students",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    assignedByUserId: integer("assigned_by_user_id")
      .notNull()
      .references(() => users.id),
    ...createdAtOnly(),
  },
  (table) => ({
    uqBatchUser: unique(BATCH_STUDENTS_CONSTRAINTS.UQ_BATCH_USER.key)
      .on(table.batchId, table.userId)
      .nullsNotDistinct(),
    userIdIdx: index("idx__batch_students__user_id").on(table.userId),
  }),
);
