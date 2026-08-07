import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function requestOtp(email: string) {
  return pbClient.post<ApiSuccessBody<null>>("/auth/otp/request", { email });
}
