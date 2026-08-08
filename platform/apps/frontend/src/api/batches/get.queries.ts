import { useQuery } from "@tanstack/react-query";
import { getBatch } from "./get.api";
import { batchQueryKey } from "./batches.types";

export function useBatch(id: number) {
  return useQuery({
    queryKey: batchQueryKey(id),
    queryFn: () => getBatch(id),
    select: (res) => res.data.data
  });
}
