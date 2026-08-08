import { z } from "zod";

export const createAdminSchema = z.object({
  orgId: z.coerce.number().int().positive("Select an organization"),
  identifier: z.string().min(1, "Identifier is required").max(255),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(1).max(20).optional().or(z.literal("")),
  whatsapp: z.string().min(1).max(20).optional().or(z.literal("")),
  alias: z.string().optional().or(z.literal("")),
  allowPasswordLogin: z.boolean()
});
export type CreateAdminValues = z.infer<typeof createAdminSchema>;
