import { batchesRepository, BATCHES_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation, NotFoundError } from "@platform/http";
import type { UpdateBatchDto } from "../dto/update-batch.dto";

export async function updateBatch(id: number, orgId: number, input: UpdateBatchDto) {
  try {
    const batch = await batchesRepository.updateBatch(id, orgId, input);
    if (!batch) {
      throw new NotFoundError("Batch not found");
    }
    return batch;
  } catch (err) {
    assertNoUniqueViolation(err, BATCHES_CONSTRAINTS);
    throw err;
  }
}
