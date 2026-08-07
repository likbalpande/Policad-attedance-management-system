import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export interface StaffLoginTokens {
  accessToken: string;
  refreshToken: string;
}

export function staffLogin(email: string, code: string) {
  return pbClient.post<ApiSuccessBody<StaffLoginTokens>>("/auth/staff/login", { email, code });
}
