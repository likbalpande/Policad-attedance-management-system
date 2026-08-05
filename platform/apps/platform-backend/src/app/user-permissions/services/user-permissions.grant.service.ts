import {
  permissionConfigGroupsRepository,
  usersRepository,
  batchesRepository,
  userPermissionsRepository,
  USER_PERMISSIONS_CONSTRAINTS,
} from "@platform/dal";
import { PERMISSION_SCOPE } from "@platform/permissions";
import { assertNoUniqueViolation, BadRequestError, NotFoundError } from "@platform/http";
import type { GrantUserPermissionDto } from "../dto/grant-user-permission.dto";

// `resourceId`'s meaning depends entirely on the target group's own `type`
// (never trust the client's own claim about scope) - branch here mirrors
// permission-config-groups.add-access-identifiers.service.ts's "validate at
// the application level, not just the DB's composite FK" approach.
export async function grantUserPermission(
  granter: { userId: number; orgId: number },
  input: GrantUserPermissionDto,
) {
  const group = await permissionConfigGroupsRepository.findPermissionConfigGroupById(
    input.permissionConfigGroupId,
  );
  if (!group) {
    throw new NotFoundError("Permission config group not found");
  }

  const targetUser = await usersRepository.findUserById(input.userId);
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }
  if (targetUser.orgId !== granter.orgId) {
    throw new BadRequestError("You can only grant permissions to users in your own organization");
  }

  let resourceId: number | null = null;
  if (group.type === PERMISSION_SCOPE.GENERAL) {
    if (input.resourceId !== undefined) {
      throw new BadRequestError("resourceId must not be provided for a general-scoped permission");
    }
  } else if (group.type === PERMISSION_SCOPE.ORG) {
    // The only org an admin/super_admin can grant org-scoped access to is
    // their own - a client-supplied resourceId here would be a cross-org
    // escalation vector, so it's ignored entirely.
    resourceId = granter.orgId;
  } else if (group.type === PERMISSION_SCOPE.BATCH) {
    if (input.resourceId === undefined) {
      throw new BadRequestError("resourceId is required for a batch-scoped permission");
    }
    const batch = await batchesRepository.findBatchById(input.resourceId, granter.orgId);
    if (!batch) {
      throw new NotFoundError("Batch not found");
    }
    resourceId = batch.id;
  } else {
    throw new BadRequestError("Course-scoped permissions are not supported yet");
  }

  try {
    return await userPermissionsRepository.grantPermission({
      userId: input.userId,
      adminPermissionsConfigGroupId: group.id,
      resourceId,
      resourceType: group.type,
      assignedByUserId: granter.userId,
    });
  } catch (err) {
    assertNoUniqueViolation(err, USER_PERMISSIONS_CONSTRAINTS);
    throw err;
  }
}
