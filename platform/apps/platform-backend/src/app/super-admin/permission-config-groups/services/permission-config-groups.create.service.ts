import { permissionConfigGroupsRepository, ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { CreatePermissionConfigGroupDto } from "../dto/create-permission-config-group.dto";

export async function createPermissionConfigGroup(input: CreatePermissionConfigGroupDto) {
  try {
    return await permissionConfigGroupsRepository.createPermissionConfigGroup(input);
  } catch (err) {
    assertNoUniqueViolation(err, ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS);
    throw err;
  }
}
