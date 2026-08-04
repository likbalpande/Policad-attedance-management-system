import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { PermissionConfigGroupIdParamsDto } from "../dto/permission-config-group-id.params.dto";
import { listAccessIdentifiersForGroup } from "../services/permission-config-groups.list-access-identifiers.service";

export const listAccessIdentifiersForGroupController: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as unknown as PermissionConfigGroupIdParamsDto;
  const accessIdentifiers = await listAccessIdentifiersForGroup(id);
  new ApiSuccessResponse("Access identifiers fetched", accessIdentifiers).send(res);
});
