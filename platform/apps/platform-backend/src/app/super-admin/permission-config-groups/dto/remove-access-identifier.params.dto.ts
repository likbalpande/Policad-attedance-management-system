import { z } from "zod";

export const removeAccessIdentifierParamsDto = z.object({
  id: z.coerce.number().int().positive(),
  accessIdentifierId: z.coerce.number().int().positive(),
});

export type RemoveAccessIdentifierParamsDto = z.infer<typeof removeAccessIdentifierParamsDto>;
