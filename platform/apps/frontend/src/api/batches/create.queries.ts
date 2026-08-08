import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateBatchDto } from "@platform/types";
import { createBatch } from "./create.api";
import { batchesQueryKey } from "./batches.types";

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBatchDto) => createBatch(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: batchesQueryKey })
  });
}
