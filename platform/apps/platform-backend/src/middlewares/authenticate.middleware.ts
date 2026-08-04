import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import jwt from "jsonwebtoken";
import { verifyStaffToken, verifyStudentToken } from "../app/auth/services/auth.tokens.service";

// Verifies the access token's signature/expiry and attaches the payload to
// req.user. Does NOT re-check loginCount against the DB - per product-idea.txt
// that check happens at /refresh only for now (no per-request check yet, see
// the auth.refresh.service.ts comments); doing it here would add a DB round
// trip to every request for a check the product spec explicitly defers.
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing or malformed Authorization header"));
    return;
  }
  const token = header.slice("Bearer ".length);

  // jwt.decode() does not verify the signature - only used to pick which
  // verify function/key to use, same pattern as auth.refresh.service.ts.
  const unverified = jwt.decode(token) as { role?: string } | null;

  try {
    req.user =
      unverified?.role === USER_ROLE.STUDENT ? verifyStudentToken(token) : verifyStaffToken(token);
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
    return;
  }
  next();
}
