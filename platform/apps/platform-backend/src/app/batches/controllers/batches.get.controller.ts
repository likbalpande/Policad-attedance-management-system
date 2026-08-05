import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import type { BatchIdParamsDto } from "../dto/batch-id.params.dto";
import { getBatch } from "../services/batches.get.service";

export const getBatchController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const { id } = req.params as unknown as BatchIdParamsDto;
  const batch = await getBatch(id, req.user.orgId);
  new ApiSuccessResponse("Batch fetched", batch).send(res);
});
