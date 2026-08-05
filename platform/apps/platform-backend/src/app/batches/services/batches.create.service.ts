import { batchesRepository, BATCHES_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { CreateBatchDto } from "../dto/create-batch.dto";

// org_id/created_by_user_id are never taken from the client - always the
// authenticated caller's own org/id, regardless of role or any grant, so a
// faculty (or anyone) can never create a batch in an org they don't belong
// to even if they somehow got a valid resourceId elsewhere.
export async function createBatch(creator: { userId: number; orgId: number }, input: CreateBatchDto) {
  try {
    return await batchesRepository.createBatch({
      title: input.title,
      alias: input.alias,
      orgId: creator.orgId,
      createdByUserId: creator.userId,
    });
  } catch (err) {
    assertNoUniqueViolation(err, BATCHES_CONSTRAINTS);
    throw err;
  }
}
