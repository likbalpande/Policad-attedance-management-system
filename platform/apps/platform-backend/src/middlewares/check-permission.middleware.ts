import type { NextFunction, Request, Response } from "express";
import { userPermissionsRepository } from "@platform/dal";
import { ForbiddenError, UnauthorizedError } from "@platform/http";
import { PERMISSIONS, type PermissionId } from "../constants/permissions.constants";

// Must run after authenticate(). Allows the request if req.user.role is in
// this permission id's bypassRoles list; otherwise does a real
// resource-scoped check against user_permissions (via
// userPermissionsRepository.userHasAccessIdentifier - see that function's
// own comment for the join it runs).
//
// `resolveResourceId` picks the resource id the permission's `resourceType`
// should be checked against for this request. Defaults to `req.user.orgId`,
// which is correct for every ORG-scoped permission (the common case - org
// is the only resource that's always known from the token alone). A
// BATCH/COURSE-scoped permission has no such default (the resource is
// whichever row the route is acting on) - its caller must pass an explicit
// resolver, e.g. `(req) => Number(req.params.id)`.
export function checkPermission(
    permissionId: PermissionId,
    resolveResourceId: (req: Request) => number | null = (req) => req.user!.orgId
) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            next(new UnauthorizedError("Authentication required"));
            return;
        }

        const permission = PERMISSIONS[permissionId];
        if ((permission.bypassRoles as readonly string[]).includes(req.user.role)) {
            next();
            return;
        }

        try {
            const hasAccess = await userPermissionsRepository.userHasAccessIdentifier({
                userId: req.user.userId,
                identifier: permission.identifier,
                type: permission.resourceType,
                resourceId: resolveResourceId(req),
            });
            if (!hasAccess) {
                next(new ForbiddenError("You do not have permission to perform this action"));
                return;
            }
            next();
        } catch (err) {
            next(err);
        }
    };
}
