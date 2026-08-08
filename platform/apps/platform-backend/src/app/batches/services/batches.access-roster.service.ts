import { usersRepository, userPermissionsRepository } from "@platform/dal";
import { PERMISSION_SCOPE, USER_ROLE, type UserRole } from "@platform/permissions";
import type { AccessRosterUser, BatchAccess } from "@platform/types";
import { PERMISSIONS } from "../../../constants/permissions.constants";

function toRosterUser(user: {
  id: number;
  identifier: string;
  alias: string | null;
  role: UserRole;
}): AccessRosterUser {
  return { id: user.id, identifier: user.identifier, alias: user.alias, role: user.role };
}

// Admins always have full (bypass) access, so there's nothing per-batch to
// resolve for them - the org's admin roster is the same on every batch.
// Faculty get a `canEdit` flag (the only batch-scoped delegable action that
// exists today - BATCH_UPDATE), resolved for every batch in one bulk query
// rather than one check per (batch, faculty) pair. The frontend is
// responsible for spotting the current user inside these lists - this
// doesn't special-case the caller at all.
export async function resolveBatchAccess(
  batchIds: number[],
  orgId: number,
): Promise<Map<number, BatchAccess>> {
  const [admins, faculties, editGrants] = await Promise.all([
    usersRepository.listUsersByRole(USER_ROLE.ADMIN, orgId),
    usersRepository.listUsersByRole(USER_ROLE.FACULTY, orgId),
    userPermissionsRepository.listGranteeIdsForAccessIdentifier({
      identifier: PERMISSIONS.BATCH_UPDATE.identifier,
      type: PERMISSION_SCOPE.BATCH,
      resourceIds: batchIds,
    }),
  ]);

  const adminRoster = admins.map(toRosterUser);

  // userId -> set of batch ids that user can edit
  const editableBatchIdsByUser = new Map<number, Set<number>>();
  for (const grant of editGrants) {
    let batchIdSet = editableBatchIdsByUser.get(grant.userId);
    if (!batchIdSet) {
      batchIdSet = new Set();
      editableBatchIdsByUser.set(grant.userId, batchIdSet);
    }
    batchIdSet.add(grant.resourceId);
  }

  const result = new Map<number, BatchAccess>();
  for (const batchId of batchIds) {
    const facultyRoster = faculties.map((faculty) => ({
      ...toRosterUser(faculty),
      canEdit: editableBatchIdsByUser.get(faculty.id)?.has(batchId) ?? false,
    }));
    result.set(batchId, { admins: adminRoster, faculties: facultyRoster });
  }

  return result;
}
