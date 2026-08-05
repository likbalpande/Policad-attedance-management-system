import { batchesRepository } from "@platform/dal";
import { resolveBatchAccess } from "./batches.access-roster.service";

export async function listBatches(orgId: number) {
  const batches = await batchesRepository.listBatches(orgId);
  const accessByBatch = await resolveBatchAccess(
    batches.map((batch) => batch.id),
    orgId,
  );
  return batches.map((batch) => ({ ...batch, access: accessByBatch.get(batch.id)! }));
}
