import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import type { ListUserPermissionsDto } from "../dto/list-user-permissions.dto";
import { listUserPermissions } from "../services/user-permissions.list.service";

export const listUserPermissionsController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const query = req.query as unknown as ListUserPermissionsDto;
  const grants = await listUserPermissions({ orgId: req.user.orgId }, query);
  new ApiSuccessResponse("Permissions fetched", grants).send(res);
});
