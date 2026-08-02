import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { RequestOtpDto } from "../dto/request-otp-auth.dto";
import { requestOtp } from "../services/auth.request-otp.service";

export const requestOtpController: RequestHandler = asyncHandler(async (req, res) => {
  const { email } = req.body as RequestOtpDto;
  await requestOtp(email);
  new ApiSuccessResponse("OTP sent", null).send(res);
});
