import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import type { BatchIdParamsDto } from "../dto/batch-id.params.dto";
import type { UpdateBatchDto } from "../dto/update-batch.dto";
import { updateBatch } from "../services/batches.update.service";

export const updateBatchController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const { id } = req.params as unknown as BatchIdParamsDto;
  const input = req.body as UpdateBatchDto;
  const batch = await updateBatch(id, req.user.orgId, input);
  new ApiSuccessResponse("Batch updated", batch).send(res);
});
