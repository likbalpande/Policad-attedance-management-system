import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  webhookUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  hasLiveAttendanceTrigger: z.boolean()
});
export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
