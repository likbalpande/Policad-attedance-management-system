import type { AdminUser, ListAdminsDto } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function listAdmins(orgId?: number) {
  const params: ListAdminsDto = { orgId };
  return pbClient.get<ApiSuccessBody<AdminUser[]>>("/super-admin/users/admins", { params });
}
