import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { RemoveAccessIdentifierParamsDto } from "../dto/remove-access-identifier.params.dto";
import { removeAccessIdentifierFromGroup } from "../services/permission-config-groups.remove-access-identifier.service";

export const removeAccessIdentifierFromGroupController: RequestHandler = asyncHandler(async (req, res) => {
  const { id, accessIdentifierId } = req.params as unknown as RemoveAccessIdentifierParamsDto;
  const removed = await removeAccessIdentifierFromGroup(id, accessIdentifierId);
  new ApiSuccessResponse("Access identifier removed from group", removed).send(res);
});
