import { z } from "zod";

export const emailStepSchema = z.object({
  email: z.string().email("Enter a valid email address")
});
export type EmailStepValues = z.infer<typeof emailStepSchema>;

export const codeStepSchema = z.object({
  code: z.string().min(1, "Enter the code sent to your email")
});
export type CodeStepValues = z.infer<typeof codeStepSchema>;
