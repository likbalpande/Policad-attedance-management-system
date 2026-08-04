import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { CreateAccessIdentifierDto } from "../dto/create-access-identifier.dto";
import { createAccessIdentifier } from "../services/access-identifiers.create.service";

export const createAccessIdentifierController: RequestHandler = asyncHandler(async (req, res) => {
  const input = req.body as CreateAccessIdentifierDto;
  const accessIdentifier = await createAccessIdentifier(input);
  new ApiSuccessResponse("Access identifier created", accessIdentifier).send(res, 201);
});
