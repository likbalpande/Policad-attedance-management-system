import { z } from "zod";

export const createAdminDto = z.object({
  orgId: z.number().int().positive(),
  identifier: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().min(1).max(20).optional(),
  whatsapp: z.string().min(1).max(20).optional(),
  alias: z.string().optional(),
  allowPasswordLogin: z.boolean().optional().default(false),
});

export type CreateAdminDto = z.infer<typeof createAdminDto>;
