import { z } from "zod";

export const listAdminsDto = z.object({
  orgId: z.coerce.number().int().positive().optional(),
});

export type ListAdminsDto = z.infer<typeof listAdminsDto>;
