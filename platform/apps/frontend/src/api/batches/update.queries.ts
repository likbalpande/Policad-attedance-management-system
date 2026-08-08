import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateBatchDto } from "@platform/types";
import { updateBatch } from "./update.api";
import { batchesQueryKey, batchQueryKey } from "./batches.types";

export function useUpdateBatch(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBatchDto) => updateBatch(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchesQueryKey });
      queryClient.invalidateQueries({ queryKey: batchQueryKey(id) });
    }
  });
}
