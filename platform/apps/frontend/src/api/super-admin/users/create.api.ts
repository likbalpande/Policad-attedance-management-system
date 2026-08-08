import type { AdminUser, CreateAdminDto } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function createAdmin(input: CreateAdminDto) {
  return pbClient.post<ApiSuccessBody<AdminUser>>("/super-admin/users/admins", input);
}
