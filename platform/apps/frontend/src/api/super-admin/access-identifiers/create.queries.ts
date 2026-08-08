import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAccessIdentifierDto } from "@platform/types";
import { createAccessIdentifier } from "./create.api";
import { accessIdentifiersQueryKeyPrefix } from "./access-identifiers.types";

export function useCreateAccessIdentifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccessIdentifierDto) => createAccessIdentifier(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accessIdentifiersQueryKeyPrefix })
  });
}
