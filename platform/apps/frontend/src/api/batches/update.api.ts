import type { Batch, UpdateBatchDto } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function updateBatch(id: number, input: UpdateBatchDto) {
  return pbClient.patch<ApiSuccessBody<Batch>>(`/batches/${id}`, input);
}
