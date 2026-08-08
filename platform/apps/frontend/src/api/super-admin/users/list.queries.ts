import { useQuery } from "@tanstack/react-query";
import { listAdmins } from "./list.api";
import { adminsQueryKey } from "./users.types";

export function useAdmins(orgId?: number) {
  return useQuery({
    queryKey: adminsQueryKey(orgId),
    queryFn: () => listAdmins(orgId),
    select: (res) => res.data.data
  });
}
