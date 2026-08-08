import type { Batch } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function deleteBatch(id: number) {
  return pbClient.delete<ApiSuccessBody<Batch>>(`/batches/${id}`);
}
