import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateOrganizationDto } from "@platform/types";
import { createOrganization } from "./create.api";
import { organizationsQueryKey } from "./organizations.types";

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationDto) => createOrganization(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationsQueryKey })
  });
}
