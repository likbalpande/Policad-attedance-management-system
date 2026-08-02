import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { StudentLoginDto } from "../dto/student-login-auth.dto";
import { studentLogin } from "../services/auth.student-login.service";

export const studentLoginController: RequestHandler = asyncHandler(async (req, res) => {
  const { identifier, orgId, password } = req.body as StudentLoginDto;
  const userAgent = req.headers["user-agent"] ?? "";
  const tokens = await studentLogin(identifier, orgId, password, userAgent);
  new ApiSuccessResponse("Login successful", tokens).send(res);
});
