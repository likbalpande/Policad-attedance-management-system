import { batchesRepository } from "@platform/dal";
import type { BatchWithAccess } from "@platform/types";
import { resolveBatchAccess } from "./batches.access-roster.service";
import { serializeBatch } from "../utils/serialize-batch";

export async function listBatches(orgId: number): Promise<BatchWithAccess[]> {
  const batches = await batchesRepository.listBatches(orgId);
  const accessByBatch = await resolveBatchAccess(
    batches.map((batch) => batch.id),
    orgId,
  );
  return batches.map((batch) => ({ ...serializeBatch(batch), access: accessByBatch.get(batch.id)! }));
}
