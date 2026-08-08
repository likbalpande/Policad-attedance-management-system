import type { PermissionScope } from "@platform/permissions";

export interface AccessIdentifier {
  id: number;
  identifier: string;
  description: string;
  type: PermissionScope;
  createdAt: string;
  updatedAt: string;
}
