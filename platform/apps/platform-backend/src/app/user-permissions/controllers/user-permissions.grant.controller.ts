import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import type { GrantUserPermissionDto } from "../dto/grant-user-permission.dto";
import { grantUserPermission } from "../services/user-permissions.grant.service";

export const grantUserPermissionController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const input = req.body as GrantUserPermissionDto;
  const grant = await grantUserPermission({ userId: req.user.userId, orgId: req.user.orgId }, input);
  new ApiSuccessResponse("Permission granted", grant).send(res, 201);
});
