import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { ListAccessIdentifiersDto } from "../dto/list-access-identifiers.dto";
import { listAccessIdentifiers } from "../services/access-identifiers.list.service";

export const listAccessIdentifiersController: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as unknown as ListAccessIdentifiersDto;
  const accessIdentifiers = await listAccessIdentifiers(query);
  new ApiSuccessResponse("Access identifiers fetched", accessIdentifiers).send(res);
});
