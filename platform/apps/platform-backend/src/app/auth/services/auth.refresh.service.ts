import jwt from "jsonwebtoken";
import { usersRepository } from "@platform/dal";
import { UnauthorizedError } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import type { StaffAccessTokenPayload, StudentAccessTokenPayload } from "@platform/types";
import {
  verifyStaffToken,
  verifyStudentToken,
  issueStaffTokens,
  issueStudentTokens,
  originMatches,
} from "./auth.tokens.service";

// Refresh token is rotated on every use (sliding TTL), not just the access
// token - otherwise an actively-used session still gets hard-logged-out the
// moment the *original* refresh token's absolute TTL elapses, no matter how
// recently the user was active. Rotating it here means an active user never
// hits that wall; an inactive one still expires after TTL of no activity.
// No server-side revocation on top of this (no refresh-token store) - the
// only invalidation lever remains loginCount, bumped on the next real login.
export async function refresh(
  refreshToken: string,
  userAgent: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  // jwt.decode() does NOT verify the signature - it only lets us branch to
  // the right verify function/key based on the claimed role. The actual
  // verifyStaffToken/verifyStudentToken call below still fully verifies the
  // signature, so a forged role claim just fails verification against the
  // wrong (or right, but tampered) token, never grants anything on its own.
  const unverified = jwt.decode(refreshToken) as { role?: string } | null;

  return unverified?.role === USER_ROLE.STUDENT
    ? refreshStudent(refreshToken, userAgent)
    : refreshStaff(refreshToken, userAgent);
}

async function refreshStaff(
  refreshToken: string,
  userAgent: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload: StaffAccessTokenPayload;
  try {
    payload = verifyStaffToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  // Reject a refresh token being replayed from a different device than it
  // was issued to.
  if (!originMatches(userAgent, payload.origin)) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await usersRepository.findUserById(payload.userId);
  if (!user) throw new UnauthorizedError("Invalid or expired refresh token");

  // Defense in depth - staffLogin() never issues a staff token for a
  // student, but don't trust that invariant blindly here too.
  if (user.role === USER_ROLE.STUDENT) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  if (user.loginCount !== payload.loginCount) {
    throw new UnauthorizedError("Session invalidated by a newer login");
  }

  return issueStaffTokens({
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
    loginCount: user.loginCount,
    userAgent,
  });
}

async function refreshStudent(
  refreshToken: string,
  userAgent: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload: StudentAccessTokenPayload;
  try {
    payload = verifyStudentToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  // Reject a refresh token being replayed from a different device than it
  // was issued to.
  if (!originMatches(userAgent, payload.origin)) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await usersRepository.findUserById(payload.userId);
  if (!user) throw new UnauthorizedError("Invalid or expired refresh token");

  // Defense in depth - studentLogin() never issues a student token for
  // staff, but don't trust that invariant blindly here too.
  if (user.role !== USER_ROLE.STUDENT) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  if (user.loginCount !== payload.loginCount) {
    throw new UnauthorizedError("Session invalidated by a newer login");
  }

  return issueStudentTokens({
    userId: user.id,
    orgId: user.orgId,
    loginCount: user.loginCount,
    userAgent,
  });
}
