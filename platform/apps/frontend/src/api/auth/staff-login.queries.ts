import { useMutation } from "@tanstack/react-query";
import { staffLogin } from "./staff-login.api";

export function useStaffLogin() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => staffLogin(email, code)
  });
}
