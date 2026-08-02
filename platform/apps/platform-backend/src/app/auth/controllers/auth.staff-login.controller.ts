import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { StaffLoginDto } from "../dto/staff-login-auth.dto";
import { staffLogin } from "../services/auth.staff-login.service";

export const staffLoginController: RequestHandler = asyncHandler(async (req, res) => {
  const { email, code } = req.body as StaffLoginDto;
  const userAgent = req.headers["user-agent"] ?? "";
  const tokens = await staffLogin(email, code, userAgent);
  new ApiSuccessResponse("Login successful", tokens).send(res);
});
