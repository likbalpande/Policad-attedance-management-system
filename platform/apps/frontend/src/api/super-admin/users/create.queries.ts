import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAdminDto } from "@platform/types";
import { createAdmin } from "./create.api";
import { adminsQueryKeyPrefix } from "./users.types";

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminDto) => createAdmin(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminsQueryKeyPrefix })
  });
}
