import type { UserRow } from "@platform/dal";

// password/otp/otpGeneratedAt never belong in an API response - password is
// stored in plain text (see table-structure.txt) and otp is a live login
// credential for the 5-minute window it's valid. A single source of truth
// for what's safe to return, applied to every user object PB sends back
// (single-row responses and list responses alike).
export type SafeUser = Omit<UserRow, "password" | "otp" | "otpGeneratedAt">;

export function sanitizeUser(user: UserRow): SafeUser {
  const { password: _password, otp: _otp, otpGeneratedAt: _otpGeneratedAt, ...safe } = user;
  return safe;
}
