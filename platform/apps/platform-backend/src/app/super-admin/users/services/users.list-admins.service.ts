import { usersRepository } from "@platform/dal";
import { USER_ROLE } from "@platform/permissions";
import type { ListAdminsDto } from "../dto/list-admins-users.dto";
import { sanitizeUser, type SafeUser } from "../utils/sanitize-user";

export async function listAdmins(input: ListAdminsDto): Promise<SafeUser[]> {
  const admins = await usersRepository.listUsersByRole(USER_ROLE.ADMIN, input.orgId);
  return admins.map(sanitizeUser);
}
