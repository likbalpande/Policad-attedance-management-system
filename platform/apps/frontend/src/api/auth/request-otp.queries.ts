import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "./request-otp.api";

export function useRequestOtp() {
  return useMutation({
    mutationFn: (email: string) => requestOtp(email)
  });
}
