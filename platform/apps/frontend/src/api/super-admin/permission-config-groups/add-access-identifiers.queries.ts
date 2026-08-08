import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAccessIdentifiersToGroup } from "./add-access-identifiers.api";
import { accessIdentifiersQueryKeyPrefix } from "../access-identifiers/access-identifiers.types";
import { permissionConfigGroupsQueryKeyPrefix } from "./permission-config-groups.types";

export function useAddAccessIdentifiersToGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, accessIdentifierIds }: { groupId: number; accessIdentifierIds: number[] }) =>
      addAccessIdentifiersToGroup(groupId, accessIdentifierIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessIdentifiersQueryKeyPrefix });
      queryClient.invalidateQueries({ queryKey: permissionConfigGroupsQueryKeyPrefix });
    }
  });
}
