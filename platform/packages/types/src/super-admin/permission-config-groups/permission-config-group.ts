import type { PermissionScope } from "@platform/permissions";

export interface PermissionConfigGroup {
  id: number;
  title: string;
  description: string;
  type: PermissionScope;
  createdAt: string;
  updatedAt: string;
}
