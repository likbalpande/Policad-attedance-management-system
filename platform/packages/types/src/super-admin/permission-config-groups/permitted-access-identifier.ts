import type { PermissionScope } from "@platform/permissions";

export interface PermittedAccessIdentifier {
  id: number;
  permissionConfigGroupId: number;
  accessIdentifierId: number;
  type: PermissionScope;
  createdAt: string;
}
