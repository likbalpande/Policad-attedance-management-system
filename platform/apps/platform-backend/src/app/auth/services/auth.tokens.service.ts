import jwt from "jsonwebtoken";
import { generateUai } from "@platform/uai";
import { signData, verifySignature } from "@platform/crypto";
import type { AccessTokenPayload, StaffAccessTokenPayload, StudentAccessTokenPayload } from "@platform/types";
import { env } from "../../../config/env.config";

interface IssueStaffTokensInput {
  userId: number;
  orgId: number;
  role: StaffAccessTokenPayload["role"];
  loginCount: number;
  userAgent: string;
}

interface IssueStudentTokensInput {
  userId: number;
  orgId: number;
  loginCount: number;
  userAgent: string;
}

// Shared by both token types - same key pair (private key 1) and algorithm
// for staff and student tokens, only the payload shape and TTLs differ.
function signTokenPair(
  payload: AccessTokenPayload,
  accessTtlSeconds: number,
  refreshTtlSeconds: number,
): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: accessTtlSeconds,
  });
  const refreshToken = jwt.sign(payload, env.JWT_ACCESS_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: refreshTtlSeconds,
  });

  return { accessToken, refreshToken };
}

export function issueStaffTokens(
  input: IssueStaffTokensInput,
): { accessToken: string; refreshToken: string } {
  // "origin" is the UAI itself asymmetrically signed with private key 2,
  // separate from the JWT's own signature (private key 1).
  const origin = signData(generateUai(input.userAgent), env.ORIGIN_SIGN_PRIVATE_KEY);

  const payload: StaffAccessTokenPayload = {
    userId: input.userId,
    orgId: input.orgId,
    role: input.role,
    loginCount: input.loginCount,
    origin,
  };

  return signTokenPair(
    payload,
    env.STAFF_ACCESS_TOKEN_TTL_SECONDS,
    env.STAFF_REFRESH_TOKEN_TTL_SECONDS,
  );
}

export function issueStudentTokens(
  input: IssueStudentTokensInput,
): { accessToken: string; refreshToken: string } {
  const origin = signData(generateUai(input.userAgent), env.ORIGIN_SIGN_PRIVATE_KEY);

  const payload: StudentAccessTokenPayload = {
    userId: input.userId,
    orgId: input.orgId,
    role: "student",
    loginCount: input.loginCount,
    origin,
  };

  return signTokenPair(
    payload,
    env.STUDENT_ACCESS_TOKEN_TTL_SECONDS,
    env.STUDENT_REFRESH_TOKEN_TTL_SECONDS,
  );
}

// Re-derives the UAI from the current request and checks it against the
// signature embedded in the token at issuance - catches a refresh token
// being replayed from a different device than it was issued to. Weak
// against an attacker who also copies the User-Agent header, but a cheap
// tripwire against accidental leaks/lazy replay. Checked at /refresh only,
// not on every request - see auth.refresh.service.ts.
export function originMatches(userAgent: string, origin: string): boolean {
  return verifySignature(generateUai(userAgent), origin, env.ORIGIN_SIGN_PUBLIC_KEY);
}

export function verifyStaffToken(token: string): StaffAccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_PUBLIC_KEY, {
    algorithms: ["RS256"],
  }) as StaffAccessTokenPayload;
}

export function verifyStudentToken(token: string): StudentAccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_PUBLIC_KEY, {
    algorithms: ["RS256"],
  }) as StudentAccessTokenPayload;
}
