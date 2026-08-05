import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import type { CreateBatchDto } from "../dto/create-batch.dto";
import { createBatch } from "../services/batches.create.service";

export const createBatchController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const input = req.body as CreateBatchDto;
  const batch = await createBatch({ userId: req.user.userId, orgId: req.user.orgId }, input);
  new ApiSuccessResponse("Batch created", batch).send(res, 201);
});
