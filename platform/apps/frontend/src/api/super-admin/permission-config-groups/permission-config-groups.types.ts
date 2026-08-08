import type { ListPermissionConfigGroupsDto } from "@platform/types";

export const permissionConfigGroupsQueryKey = (params?: ListPermissionConfigGroupsDto) =>
  ["super-admin", "permission-config-groups", params ?? {}] as const;
export const permissionConfigGroupsQueryKeyPrefix = ["super-admin", "permission-config-groups"] as const;
