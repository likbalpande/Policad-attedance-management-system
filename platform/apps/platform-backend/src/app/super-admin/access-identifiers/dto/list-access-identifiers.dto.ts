import { z } from "zod";
import { PERMISSION_SCOPE, type PermissionScope } from "@platform/permissions";

const PERMISSION_SCOPE_VALUES = Object.values(PERMISSION_SCOPE) as [
  PermissionScope,
  ...PermissionScope[],
];

export const listAccessIdentifiersDto = z.object({
  type: z.enum(PERMISSION_SCOPE_VALUES).optional(),
});

export type ListAccessIdentifiersDto = z.infer<typeof listAccessIdentifiersDto>;
