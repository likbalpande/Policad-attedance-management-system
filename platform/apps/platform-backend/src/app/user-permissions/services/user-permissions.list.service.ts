import { usersRepository, userPermissionsRepository } from "@platform/dal";
import { BadRequestError, NotFoundError } from "@platform/http";
import type { ListUserPermissionsDto } from "../dto/list-user-permissions.dto";

export async function listUserPermissions(caller: { orgId: number }, input: ListUserPermissionsDto) {
  const targetUser = await usersRepository.findUserById(input.userId);
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }
  if (targetUser.orgId !== caller.orgId) {
    throw new BadRequestError("You can only view permissions for users in your own organization");
  }
  return userPermissionsRepository.listPermissionsForUser(input.userId);
}
