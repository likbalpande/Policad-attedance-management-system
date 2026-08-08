import type { AddAccessIdentifiersDto, PermittedAccessIdentifier } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function addAccessIdentifiersToGroup(groupId: number, accessIdentifierIds: number[]) {
  const body: AddAccessIdentifiersDto = { accessIdentifierIds };
  return pbClient.post<ApiSuccessBody<PermittedAccessIdentifier[]>>(
    `/super-admin/permission-config-groups/${groupId}/access-identifiers`,
    body
  );
}
