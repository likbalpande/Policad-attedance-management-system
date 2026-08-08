import {
  accessIdentifiersRepository,
  permissionConfigGroupsRepository,
  permittedAccessIdentifiersRepository,
} from "@platform/dal";
import { NotFoundError } from "@platform/http";
import type { AccessIdentifier, ListAccessIdentifiersDto } from "@platform/types";
import { serializeAccessIdentifier } from "../utils/serialize-access-identifier";

export async function listAccessIdentifiers(input: ListAccessIdentifiersDto): Promise<AccessIdentifier[]> {
  if (input.permissionConfigGroupId === undefined) {
    const identifiers = await accessIdentifiersRepository.listAccessIdentifiers(input.type);
    return identifiers.map(serializeAccessIdentifier);
  }

  const group = await permissionConfigGroupsRepository.findPermissionConfigGroupById(
    input.permissionConfigGroupId,
  );
  if (!group) {
    throw new NotFoundError("Permission config group not found");
  }

  const identifiers = await permittedAccessIdentifiersRepository.listAccessIdentifiersForGroup(
    input.permissionConfigGroupId,
  );
  // Applied in-memory rather than pushed into the join query - these are
  // small, admin-configured catalogs, and keeping the join owned by
  // permitted-access-identifiers.repository.ts (the join table) avoids
  // pulling admin_permitted_access_identifiers into this table's own repo.
  const filtered =
    input.type !== undefined ? identifiers.filter((identifier) => identifier.type === input.type) : identifiers;
  return filtered.map(serializeAccessIdentifier);
}
