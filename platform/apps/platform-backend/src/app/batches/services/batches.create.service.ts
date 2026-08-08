import { batchesRepository, BATCHES_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { Batch, CreateBatchDto } from "@platform/types";
import { serializeBatch } from "../utils/serialize-batch";

// org_id/created_by_user_id are never taken from the client - always the
// authenticated caller's own org/id, regardless of role or any grant, so a
// faculty (or anyone) can never create a batch in an org they don't belong
// to even if they somehow got a valid resourceId elsewhere.
export async function createBatch(
  creator: { userId: number; orgId: number },
  input: CreateBatchDto,
): Promise<Batch> {
  try {
    const batch = await batchesRepository.createBatch({
      title: input.title,
      alias: input.alias,
      orgId: creator.orgId,
      createdByUserId: creator.userId,
    });
    return serializeBatch(batch);
  } catch (err) {
    assertNoUniqueViolation(err, BATCHES_CONSTRAINTS);
    throw err;
  }
}
