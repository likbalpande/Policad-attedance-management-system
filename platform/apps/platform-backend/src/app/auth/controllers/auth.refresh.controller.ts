import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { RefreshDto } from "../dto/refresh-auth.dto";
import { refresh } from "../services/auth.refresh.service";

export const refreshController: RequestHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as RefreshDto;
  const userAgent = req.headers["user-agent"] ?? "";
  const tokens = await refresh(refreshToken, userAgent);
  new ApiSuccessResponse("Token refreshed", tokens).send(res);
});
