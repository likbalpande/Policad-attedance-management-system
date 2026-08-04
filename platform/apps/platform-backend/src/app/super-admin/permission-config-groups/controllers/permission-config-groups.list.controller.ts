import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { ListPermissionConfigGroupsDto } from "../dto/list-permission-config-groups.dto";
import { listPermissionConfigGroups } from "../services/permission-config-groups.list.service";

export const listPermissionConfigGroupsController: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as unknown as ListPermissionConfigGroupsDto;
  const groups = await listPermissionConfigGroups(query);
  new ApiSuccessResponse("Permission config groups fetched", groups).send(res);
});
