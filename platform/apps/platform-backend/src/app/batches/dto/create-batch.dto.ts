import { z } from "zod";

export const createBatchDto = z.object({
  title: z.string().min(1).max(50),
  alias: z.string().min(1).optional(),
});

export type CreateBatchDto = z.infer<typeof createBatchDto>;
