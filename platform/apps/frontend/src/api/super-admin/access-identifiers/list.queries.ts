import { useQuery } from "@tanstack/react-query";
import type { ListAccessIdentifiersDto } from "@platform/types";
import { listAccessIdentifiers } from "./list.api";
import { accessIdentifiersQueryKey } from "./access-identifiers.types";

export function useAccessIdentifiers(params?: ListAccessIdentifiersDto) {
  return useQuery({
    queryKey: accessIdentifiersQueryKey(params),
    queryFn: () => listAccessIdentifiers(params),
    select: (res) => res.data.data
  });
}
