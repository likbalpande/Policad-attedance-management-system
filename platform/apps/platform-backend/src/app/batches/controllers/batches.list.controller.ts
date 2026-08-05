import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import { listBatches } from "../services/batches.list.service";

export const listBatchesController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const batches = await listBatches(req.user.orgId);
  new ApiSuccessResponse("Batches fetched", batches).send(res);
});
