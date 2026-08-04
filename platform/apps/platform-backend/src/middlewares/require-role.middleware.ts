import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@platform/http";
import type { UserRole } from "@platform/permissions";

// Must run after authenticate(). A blunt role gate, unlike checkPermission(id)
// - no notion of a specific, potentially-delegable permission identifier.
// Only for routes that are permanently non-delegable (e.g. everything under
// app/super-admin/ - see the architecture skill's "Auth & RBAC middleware"
// section). A route whose access could ever be granted to another role via a
// permission config group belongs on checkPermission(id) instead of this.
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError("You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
