import type { UserRole } from "@platform/permissions";

// password/otp/otpGeneratedAt are never part of this - see PB's
// sanitize-user.ts for why. Wire shape (string dates), same reasoning as
// Organization.
export interface AdminUser {
  id: number;
  identifier: string;
  orgId: number;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  role: UserRole;
  passwordGeneratedAt: string;
  loginCount: number;
  lastLoginAt: string | null;
  allowPasswordLogin: boolean;
  alias: string | null;
  createdByUserId: number | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
