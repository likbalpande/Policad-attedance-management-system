import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { AddAccessIdentifiersDto } from "../dto/add-access-identifiers.dto";
import type { PermissionConfigGroupIdParamsDto } from "../dto/permission-config-group-id.params.dto";
import { addAccessIdentifiersToGroup } from "../services/permission-config-groups.add-access-identifiers.service";

export const addAccessIdentifiersToGroupController: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params as unknown as PermissionConfigGroupIdParamsDto;
  const input = req.body as AddAccessIdentifiersDto;
  const permittedAccessIdentifiers = await addAccessIdentifiersToGroup(id, input);
  new ApiSuccessResponse("Access identifiers attached", permittedAccessIdentifiers).send(res, 201);
});
