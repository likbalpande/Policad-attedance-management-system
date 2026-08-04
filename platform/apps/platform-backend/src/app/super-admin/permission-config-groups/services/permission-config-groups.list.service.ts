import { permissionConfigGroupsRepository } from "@platform/dal";
import type { ListPermissionConfigGroupsDto } from "../dto/list-permission-config-groups.dto";

export async function listPermissionConfigGroups(input: ListPermissionConfigGroupsDto) {
  return permissionConfigGroupsRepository.listPermissionConfigGroups(input.type);
}
