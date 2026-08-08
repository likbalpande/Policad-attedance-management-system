import { permissionConfigGroupsRepository } from "@platform/dal";
import type { ListPermissionConfigGroupsDto, PermissionConfigGroup } from "@platform/types";
import { serializePermissionConfigGroup } from "../utils/serialize-permission-config-group";

export async function listPermissionConfigGroups(
  input: ListPermissionConfigGroupsDto,
): Promise<PermissionConfigGroup[]> {
  const groups = await permissionConfigGroupsRepository.listPermissionConfigGroups(input.type);
  return groups.map(serializePermissionConfigGroup);
}
