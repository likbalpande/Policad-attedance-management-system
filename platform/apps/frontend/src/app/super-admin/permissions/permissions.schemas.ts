import { z } from "zod";
import { PERMISSION_SCOPE, type PermissionScope } from "@platform/permissions";

const PERMISSION_SCOPE_VALUES = Object.values(PERMISSION_SCOPE) as [PermissionScope, ...PermissionScope[]];

export const createAccessIdentifierSchema = z.object({
  identifier: z.string().min(1, "Identifier is required").max(50),
  description: z.string().min(1, "Description is required").max(50),
  type: z.enum(PERMISSION_SCOPE_VALUES)
});
export type CreateAccessIdentifierValues = z.infer<typeof createAccessIdentifierSchema>;

export const createPermissionConfigGroupSchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  description: z.string().min(1, "Description is required"),
  type: z.enum(PERMISSION_SCOPE_VALUES)
});
export type CreatePermissionConfigGroupValues = z.infer<typeof createPermissionConfigGroupSchema>;
