import { usersRepository } from "@platform/dal";
import { USER_ROLE } from "@platform/permissions";
import type { ListAdminsDto, AdminUser } from "@platform/types";
import { sanitizeUser } from "../utils/sanitize-user";

export async function listAdmins(input: ListAdminsDto): Promise<AdminUser[]> {
  const admins = await usersRepository.listUsersByRole(USER_ROLE.ADMIN, input.orgId);
  return admins.map(sanitizeUser);
}
