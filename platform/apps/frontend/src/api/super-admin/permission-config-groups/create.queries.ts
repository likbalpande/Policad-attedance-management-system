import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePermissionConfigGroupDto } from "@platform/types";
import { createPermissionConfigGroup } from "./create.api";
import { permissionConfigGroupsQueryKeyPrefix } from "./permission-config-groups.types";

export function useCreatePermissionConfigGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePermissionConfigGroupDto) => createPermissionConfigGroup(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: permissionConfigGroupsQueryKeyPrefix })
  });
}
