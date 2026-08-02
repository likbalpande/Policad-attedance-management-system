import { z } from "zod";

export const requestOtpDto = z.object({
  email: z.string().email(),
});

export type RequestOtpDto = z.infer<typeof requestOtpDto>;
