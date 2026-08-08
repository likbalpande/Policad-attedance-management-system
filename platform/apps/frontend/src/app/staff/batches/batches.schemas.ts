import { z } from "zod";

export const createBatchSchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  alias: z.string().min(1).optional().or(z.literal(""))
});
export type CreateBatchValues = z.infer<typeof createBatchSchema>;

export const updateBatchSchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  alias: z.string().min(1).optional().or(z.literal(""))
});
export type UpdateBatchValues = z.infer<typeof updateBatchSchema>;
