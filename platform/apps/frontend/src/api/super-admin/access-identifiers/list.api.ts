import type { AccessIdentifier, ListAccessIdentifiersDto } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function listAccessIdentifiers(params?: ListAccessIdentifiersDto) {
  return pbClient.get<ApiSuccessBody<AccessIdentifier[]>>("/super-admin/access-identifiers", { params });
}
