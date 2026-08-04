import { z } from "zod";
import { PERMISSION_SCOPE, type PermissionScope } from "@platform/permissions";

const PERMISSION_SCOPE_VALUES = Object.values(PERMISSION_SCOPE) as [
  PermissionScope,
  ...PermissionScope[],
];

export const createPermissionConfigGroupDto = z.object({
  title: z.string().min(1).max(50),
  description: z.string().min(1),
  type: z.enum(PERMISSION_SCOPE_VALUES),
});

export type CreatePermissionConfigGroupDto = z.infer<typeof createPermissionConfigGroupDto>;
