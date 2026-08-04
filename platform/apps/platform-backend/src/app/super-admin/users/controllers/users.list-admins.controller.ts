import type { RequestHandler } from "express";
import { asyncHandler, ApiSuccessResponse } from "@platform/http";
import type { ListAdminsDto } from "../dto/list-admins-users.dto";
import { listAdmins } from "../services/users.list-admins.service";

export const listAdminsController: RequestHandler = asyncHandler(async (req, res) => {
  const query = req.query as unknown as ListAdminsDto;
  const admins = await listAdmins(query);
  new ApiSuccessResponse("Admins fetched", admins).send(res);
});
