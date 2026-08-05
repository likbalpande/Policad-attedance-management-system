import { batchesRepository } from "@platform/dal";
import { NotFoundError } from "@platform/http";
import { resolveBatchAccess } from "./batches.access-roster.service";

// 404, not just "not found in this org" vs "doesn't exist" - a batch id
// belonging to another org must look identical to a nonexistent id, so
// cross-org existence is never leaked.
export async function getBatch(id: number, orgId: number) {
  const batch = await batchesRepository.findBatchById(id, orgId);
  if (!batch) {
    throw new NotFoundError("Batch not found");
  }
  const accessByBatch = await resolveBatchAccess([batch.id], orgId);
  return { ...batch, access: accessByBatch.get(batch.id)! };
}
