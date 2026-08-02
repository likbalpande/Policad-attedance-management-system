import { logger } from "../logger";

// Stub for local dev/testing - swap the body for a real provider (Resend,
// AWS SES, SMTP via nodemailer, ...) later. Callers don't need to change.
export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  logger.info("OTP email (stub - not actually sent)", { email, otp });
}
