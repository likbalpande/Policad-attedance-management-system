import { z } from "zod";

export const staffLoginDto = z.object({
  email: z.string().email(),
  // OTP digits, or the user's password if allow_password_login is true -
  // the service tries OTP first, then falls back to password.
  code: z.string().min(1),
});

export type StaffLoginDto = z.infer<typeof staffLoginDto>;
