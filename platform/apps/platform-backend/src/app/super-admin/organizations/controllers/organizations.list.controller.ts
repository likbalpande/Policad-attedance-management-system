import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import { listOrganizations } from "../services/organizations.list.service";

export const listOrganizationsController: RequestHandler = asyncHandler(async (_req, res) => {
  const organizations = await listOrganizations();
  new ApiSuccessResponse("Organizations fetched", organizations).send(res);
});
