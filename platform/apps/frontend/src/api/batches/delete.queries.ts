import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBatch } from "./delete.api";
import { batchesQueryKey } from "./batches.types";

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBatch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: batchesQueryKey })
  });
}
