import type { PermittedAccessIdentifier } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function removeAccessIdentifierFromGroup(groupId: number, accessIdentifierId: number) {
  return pbClient.delete<ApiSuccessBody<PermittedAccessIdentifier>>(
    `/super-admin/permission-config-groups/${groupId}/access-identifiers/${accessIdentifierId}`
  );
}
