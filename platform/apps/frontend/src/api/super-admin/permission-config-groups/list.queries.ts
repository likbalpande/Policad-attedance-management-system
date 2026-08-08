import { useQuery } from "@tanstack/react-query";
import type { ListPermissionConfigGroupsDto } from "@platform/types";
import { listPermissionConfigGroups } from "./list.api";
import { permissionConfigGroupsQueryKey } from "./permission-config-groups.types";

export function usePermissionConfigGroups(params?: ListPermissionConfigGroupsDto) {
  return useQuery({
    queryKey: permissionConfigGroupsQueryKey(params),
    queryFn: () => listPermissionConfigGroups(params),
    select: (res) => res.data.data
  });
}
