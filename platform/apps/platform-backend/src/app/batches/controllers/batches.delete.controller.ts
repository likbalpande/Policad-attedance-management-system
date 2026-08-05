import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import type { BatchIdParamsDto } from "../dto/batch-id.params.dto";
import { deleteBatch } from "../services/batches.delete.service";

export const deleteBatchController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const { id } = req.params as unknown as BatchIdParamsDto;
  const batch = await deleteBatch(id, req.user.orgId);
  new ApiSuccessResponse("Batch deleted", batch).send(res);
});
