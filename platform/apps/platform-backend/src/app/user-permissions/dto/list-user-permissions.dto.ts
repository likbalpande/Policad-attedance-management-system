import { z } from "zod";

export const listUserPermissionsDto = z.object({
  userId: z.coerce.number().int().positive(),
});

export type ListUserPermissionsDto = z.infer<typeof listUserPermissionsDto>;
