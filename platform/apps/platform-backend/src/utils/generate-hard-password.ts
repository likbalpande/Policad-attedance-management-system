import { randomBytes } from "node:crypto";

// Unlike generateOtp(), this is never meant to be typed in by a human - it
// replaces a student's password the instant it's used, so nobody (not even
// the admin who triggered the reset) knows it afterward. See
// product-idea.txt's student login section.
export function generateHardPassword(): string {
  return randomBytes(24).toString("base64url");
}
