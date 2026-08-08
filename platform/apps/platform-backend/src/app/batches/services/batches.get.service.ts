import { batchesRepository } from "@platform/dal";
import { NotFoundError } from "@platform/http";
import type { BatchWithAccess } from "@platform/types";
import { resolveBatchAccess } from "./batches.access-roster.service";
import { serializeBatch } from "../utils/serialize-batch";

// 404, not just "not found in this org" vs "doesn't exist" - a batch id
// belonging to another org must look identical to a nonexistent id, so
// cross-org existence is never leaked.
export async function getBatch(id: number, orgId: number): Promise<BatchWithAccess> {
  const batch = await batchesRepository.findBatchById(id, orgId);
  if (!batch) {
    throw new NotFoundError("Batch not found");
  }
  const accessByBatch = await resolveBatchAccess([batch.id], orgId);
  return { ...serializeBatch(batch), access: accessByBatch.get(batch.id)! };
}
