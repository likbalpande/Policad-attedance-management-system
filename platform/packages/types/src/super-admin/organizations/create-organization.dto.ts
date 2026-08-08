import { z } from "zod";

export const createOrganizationDto = z.object({
  name: z.string().min(1).max(100),
  logoUrl: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
  hasLiveAttendanceTrigger: z.boolean().optional().default(false)
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationDto>;
