import type { UserRow } from "@platform/dal";
import type { AdminUser } from "@platform/types";

// password/otp/otpGeneratedAt never belong in an API response - password is
// stored in plain text (see table-structure.txt) and otp is a live login
// credential for the 5-minute window it's valid. A single source of truth
// for what's safe to return, applied to every user object PB sends back
// (single-row responses and list responses alike). Also formats Date
// columns to the wire (ISO string) shape AdminUser declares.
export function sanitizeUser(user: UserRow): AdminUser {
  return {
    id: user.id,
    identifier: user.identifier,
    orgId: user.orgId,
    email: user.email,
    phone: user.phone,
    whatsapp: user.whatsapp,
    role: user.role,
    passwordGeneratedAt: user.passwordGeneratedAt.toISOString(),
    loginCount: user.loginCount,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    allowPasswordLogin: user.allowPasswordLogin,
    alias: user.alias,
    createdByUserId: user.createdByUserId,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}
