import { batchesRepository } from "@platform/dal";
import { NotFoundError } from "@platform/http";
import type { Batch } from "@platform/types";
import { serializeBatch } from "../utils/serialize-batch";

export async function deleteBatch(id: number, orgId: number): Promise<Batch> {
  const batch = await batchesRepository.softDeleteBatch(id, orgId);
  if (!batch) {
    throw new NotFoundError("Batch not found");
  }
  return serializeBatch(batch);
}
