import { pgTable, serial, integer, unique, index } from "drizzle-orm/pg-core";
import { batches } from "./batches";
import { users } from "./users";
import { createdAtOnly } from "./timestamps";

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
    uqBatchUser: unique("uq__batch_students__batch_id__user_id")
      .on(table.batchId, table.userId)
      .nullsNotDistinct(),
    userIdIdx: index("idx__batch_students__user_id").on(table.userId),
  }),
);
