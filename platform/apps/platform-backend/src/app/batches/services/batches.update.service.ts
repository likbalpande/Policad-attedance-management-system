import { batchesRepository, BATCHES_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation, NotFoundError } from "@platform/http";
import type { Batch, UpdateBatchDto } from "@platform/types";
import { serializeBatch } from "../utils/serialize-batch";

export async function updateBatch(id: number, orgId: number, input: UpdateBatchDto): Promise<Batch> {
  try {
    const batch = await batchesRepository.updateBatch(id, orgId, input);
    if (!batch) {
      throw new NotFoundError("Batch not found");
    }
    return serializeBatch(batch);
  } catch (err) {
    assertNoUniqueViolation(err, BATCHES_CONSTRAINTS);
    throw err;
  }
}
