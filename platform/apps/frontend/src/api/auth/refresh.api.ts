import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";
import type { StaffLoginTokens } from "./staff-login.api";

// No .queries.ts pair - only auth-refresh.ts's interceptor calls this,
// it's never a user-triggered mutation.
export function refreshTokens(refreshToken: string) {
  return pbClient.post<ApiSuccessBody<StaffLoginTokens>>("/auth/refresh", { refreshToken });
}
