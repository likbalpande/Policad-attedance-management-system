import type { AccessIdentifier, CreateAccessIdentifierDto } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function createAccessIdentifier(input: CreateAccessIdentifierDto) {
  return pbClient.post<ApiSuccessBody<AccessIdentifier>>("/super-admin/access-identifiers", input);
}
