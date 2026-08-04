import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { CreatePermissionConfigGroupDto } from "../dto/create-permission-config-group.dto";
import { createPermissionConfigGroup } from "../services/permission-config-groups.create.service";

export const createPermissionConfigGroupController: RequestHandler = asyncHandler(async (req, res) => {
  const input = req.body as CreatePermissionConfigGroupDto;
  const group = await createPermissionConfigGroup(input);
  new ApiSuccessResponse("Permission config group created", group).send(res, 201);
});
