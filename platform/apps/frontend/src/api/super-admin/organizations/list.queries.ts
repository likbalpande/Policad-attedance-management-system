import { useQuery } from "@tanstack/react-query";
import { listOrganizations } from "./list.api";
import { organizationsQueryKey } from "./organizations.types";

export function useOrganizations() {
  return useQuery({
    queryKey: organizationsQueryKey,
    queryFn: listOrganizations,
    select: (res) => res.data.data
  });
}
