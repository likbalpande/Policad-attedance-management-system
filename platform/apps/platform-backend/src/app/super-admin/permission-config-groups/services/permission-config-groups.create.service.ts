import { permissionConfigGroupsRepository, ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { CreatePermissionConfigGroupDto, PermissionConfigGroup } from "@platform/types";
import { serializePermissionConfigGroup } from "../utils/serialize-permission-config-group";

export async function createPermissionConfigGroup(
  input: CreatePermissionConfigGroupDto,
): Promise<PermissionConfigGroup> {
  try {
    const group = await permissionConfigGroupsRepository.createPermissionConfigGroup(input);
    return serializePermissionConfigGroup(group);
  } catch (err) {
    assertNoUniqueViolation(err, ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS);
    throw err;
  }
}
