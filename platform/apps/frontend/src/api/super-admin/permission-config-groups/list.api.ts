import type { ListPermissionConfigGroupsDto, PermissionConfigGroup } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function listPermissionConfigGroups(params?: ListPermissionConfigGroupsDto) {
  return pbClient.get<ApiSuccessBody<PermissionConfigGroup[]>>("/super-admin/permission-config-groups", {
    params
  });
}
