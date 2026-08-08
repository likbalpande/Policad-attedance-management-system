import type { CreatePermissionConfigGroupDto, PermissionConfigGroup } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function createPermissionConfigGroup(input: CreatePermissionConfigGroupDto) {
  return pbClient.post<ApiSuccessBody<PermissionConfigGroup>>("/super-admin/permission-config-groups", input);
}
