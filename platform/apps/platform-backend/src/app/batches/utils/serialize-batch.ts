import type { BatchRow } from "@platform/dal";
import type { Batch } from "@platform/types";

export function serializeBatch(row: BatchRow): Batch {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
