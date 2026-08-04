import { z } from "zod";

export const permissionConfigGroupIdParamsDto = z.object({
  id: z.coerce.number().int().positive(),
});

export type PermissionConfigGroupIdParamsDto = z.infer<typeof permissionConfigGroupIdParamsDto>;
