import { z } from "zod";

export const studentLoginDto = z.object({
  // identifier is only unique per org (uq__users__identifier__org_id), so
  // orgId must travel alongside it to disambiguate - unlike staff login,
  // which resolves the user via the globally-unique email instead.
  identifier: z.string().min(1),
  orgId: z.number().int().positive(),
  password: z.string().min(1),
});

export type StudentLoginDto = z.infer<typeof studentLoginDto>;
