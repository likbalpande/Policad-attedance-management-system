import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAccessIdentifierFromGroup } from "./remove-access-identifier.api";
import { accessIdentifiersQueryKeyPrefix } from "../access-identifiers/access-identifiers.types";
import { permissionConfigGroupsQueryKeyPrefix } from "./permission-config-groups.types";

export function useRemoveAccessIdentifierFromGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, accessIdentifierId }: { groupId: number; accessIdentifierId: number }) =>
      removeAccessIdentifierFromGroup(groupId, accessIdentifierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessIdentifiersQueryKeyPrefix });
      queryClient.invalidateQueries({ queryKey: permissionConfigGroupsQueryKeyPrefix });
    }
  });
}
