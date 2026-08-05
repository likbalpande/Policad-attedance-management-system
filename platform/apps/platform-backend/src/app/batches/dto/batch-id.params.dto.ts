import { z } from "zod";

export const batchIdParamsDto = z.object({
  id: z.coerce.number().int().positive(),
});

export type BatchIdParamsDto = z.infer<typeof batchIdParamsDto>;
