import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { CreateOrganizationDto } from "../dto/create-organizations.dto";
import { createOrganization } from "../services/organizations.create.service";

export const createOrganizationController: RequestHandler = asyncHandler(async (req, res) => {
  const input = req.body as CreateOrganizationDto;
  const organization = await createOrganization(input);
  new ApiSuccessResponse("Organization created", organization).send(res, 201);
});
