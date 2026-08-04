import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@platform/http";
import { PERMISSIONS, type PermissionId } from "../constants/permissions.constants";

// Must run after authenticate(). Allows the request if req.user.role is in
// this permission id's bypassRoles list. Resource-scoped P_O/P_B/P_C checks
// (against admin_permitted_access_identifiers) are not implemented yet - see
// permissions.constants.ts - so a non-bypass role is denied outright for now.
export function checkPermission(permissionId: PermissionId) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    const { bypassRoles } = PERMISSIONS[permissionId];
    if ((bypassRoles as readonly string[]).includes(req.user.role)) {
      next();
      return;
    }

    next(new ForbiddenError("You do not have permission to perform this action"));
  };
}
