import type { Batch, CreateBatchDto } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function createBatch(input: CreateBatchDto) {
  return pbClient.post<ApiSuccessBody<Batch>>("/batches", input);
}
