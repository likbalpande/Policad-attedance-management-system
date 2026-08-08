import { useQuery } from "@tanstack/react-query";
import { listBatches } from "./list.api";
import { batchesQueryKey } from "./batches.types";

export function useBatches() {
  return useQuery({
    queryKey: batchesQueryKey,
    queryFn: listBatches,
    select: (res) => res.data.data
  });
}
