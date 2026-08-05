import { batchesRepository } from "@platform/dal";
import { NotFoundError } from "@platform/http";

export async function deleteBatch(id: number, orgId: number) {
  const batch = await batchesRepository.softDeleteBatch(id, orgId);
  if (!batch) {
    throw new NotFoundError("Batch not found");
  }
  return batch;
}
