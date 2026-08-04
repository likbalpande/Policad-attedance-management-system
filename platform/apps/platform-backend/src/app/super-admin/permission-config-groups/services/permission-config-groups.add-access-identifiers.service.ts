import {
  permissionConfigGroupsRepository,
  accessIdentifiersRepository,
  permittedAccessIdentifiersRepository,
  ADMIN_PERMITTED_ACCESS_IDENTIFIERS_CONSTRAINTS,
} from "@platform/dal";
import { assertNoUniqueViolation, BadRequestError, NotFoundError } from "@platform/http";
import type { AddAccessIdentifiersDto } from "../dto/add-access-identifiers.dto";

// Validates at the application level (not just leaning on the DB's
// composite FKs) so a mismatch/missing id surfaces as a clean 400/404
// instead of a raw FK-violation error - see the plan's note on this.
export async function addAccessIdentifiersToGroup(groupId: number, input: AddAccessIdentifiersDto) {
  const group = await permissionConfigGroupsRepository.findPermissionConfigGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Permission config group not found");
  }

  const identifiers = await accessIdentifiersRepository.findAccessIdentifiersByIds(
    input.accessIdentifierIds,
  );
  const foundIds = new Set(identifiers.map((identifier) => identifier.id));
  const missingIds = input.accessIdentifierIds.filter((id) => !foundIds.has(id));
  if (missingIds.length > 0) {
    throw new BadRequestError(`Access identifier(s) not found: ${missingIds.join(", ")}`);
  }

  const mismatchedIds = identifiers
    .filter((identifier) => identifier.type !== group.type)
    .map((identifier) => identifier.id);
  if (mismatchedIds.length > 0) {
    throw new BadRequestError(
      `Access identifier(s) do not match group type "${group.type}": ${mismatchedIds.join(", ")}`,
    );
  }

  try {
    return await permittedAccessIdentifiersRepository.addAccessIdentifiersToGroup(
      groupId,
      group.type,
      input.accessIdentifierIds,
    );
  } catch (err) {
    assertNoUniqueViolation(err, ADMIN_PERMITTED_ACCESS_IDENTIFIERS_CONSTRAINTS);
    throw err;
  }
}
