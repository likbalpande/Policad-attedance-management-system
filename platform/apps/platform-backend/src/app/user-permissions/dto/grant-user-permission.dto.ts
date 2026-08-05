import { z } from "zod";

export const grantUserPermissionDto = z.object({
  userId: z.number().int().positive(),
  permissionConfigGroupId: z.number().int().positive(),
  resourceId: z.number().int().positive().optional(),
});

export type GrantUserPermissionDto = z.infer<typeof grantUserPermissionDto>;
