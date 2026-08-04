import { permissionConfigGroupsRepository, permittedAccessIdentifiersRepository } from "@platform/dal";
import { NotFoundError } from "@platform/http";

export async function listAccessIdentifiersForGroup(groupId: number) {
  const group = await permissionConfigGroupsRepository.findPermissionConfigGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Permission config group not found");
  }
  return permittedAccessIdentifiersRepository.listAccessIdentifiersForGroup(groupId);
}
