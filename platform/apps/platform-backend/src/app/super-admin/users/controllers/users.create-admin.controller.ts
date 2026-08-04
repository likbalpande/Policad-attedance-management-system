import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse, UnauthorizedError } from "@platform/http";
import type { CreateAdminDto } from "../dto/create-admin-users.dto";
import { createAdmin } from "../services/users.create-admin.service";

export const createAdminController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const input = req.body as CreateAdminDto;
  const admin = await createAdmin(input, req.user.userId);
  new ApiSuccessResponse("Admin created", admin).send(res, 201);
});
