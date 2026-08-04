import { permissionConfigGroupsRepository, permittedAccessIdentifiersRepository } from "@platform/dal";
import { NotFoundError } from "@platform/http";

export async function removeAccessIdentifierFromGroup(groupId: number, accessIdentifierId: number) {
  const group = await permissionConfigGroupsRepository.findPermissionConfigGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Permission config group not found");
  }

  const removed = await permittedAccessIdentifiersRepository.removeAccessIdentifierFromGroup(
    groupId,
    accessIdentifierId,
  );
  if (!removed) {
    throw new NotFoundError("This access identifier is not permitted for this group");
  }
  return removed;
}
