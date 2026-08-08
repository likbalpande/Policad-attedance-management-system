import type { BatchWithAccess } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function listBatches() {
  return pbClient.get<ApiSuccessBody<BatchWithAccess[]>>("/batches");
}
