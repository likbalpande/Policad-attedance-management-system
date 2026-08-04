import { z } from "zod";
import { PERMISSION_SCOPE, type PermissionScope } from "@platform/permissions";

const PERMISSION_SCOPE_VALUES = Object.values(PERMISSION_SCOPE) as [
  PermissionScope,
  ...PermissionScope[],
];

export const createAccessIdentifierDto = z.object({
  identifier: z.string().min(1).max(50),
  description: z.string().min(1).max(50),
  type: z.enum(PERMISSION_SCOPE_VALUES),
});

export type CreateAccessIdentifierDto = z.infer<typeof createAccessIdentifierDto>;
