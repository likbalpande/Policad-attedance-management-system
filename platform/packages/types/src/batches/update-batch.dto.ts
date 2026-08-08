import { z } from "zod";

export const updateBatchDto = z
  .object({
    title: z.string().min(1).max(50).optional(),
    alias: z.string().min(1).optional(),
    isArchived: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type UpdateBatchDto = z.infer<typeof updateBatchDto>;
