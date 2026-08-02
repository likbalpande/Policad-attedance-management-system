import { pgTable, serial, integer, unique, index } from "drizzle-orm/pg-core";
import { batches } from "./batches";
import { batchTags } from "./batch-tags";
import { users } from "./users";
import { createdAtOnly } from "./timestamps";

export const batchTagMap = pgTable(
  "batch_tag_map",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id),
    batchTagId: integer("batch_tag_id")
      .notNull()
      .references(() => batchTags.id),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    ...createdAtOnly(),
  },
  (table) => ({
    uqBatchTag: unique("uq__batch_tag_map__batch_id__batch_tag_id")
      .on(table.batchId, table.batchTagId)
      .nullsNotDistinct(),
    batchTagIdIdx: index("idx__batch_tag_map__batch_tag_id").on(table.batchTagId),
  }),
);
