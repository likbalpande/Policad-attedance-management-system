import { Router } from "express";
import { validate } from "@platform/http";
import { createAdminDto } from "./dto/create-admin-users.dto";
import { listAdminsDto } from "./dto/list-admins-users.dto";
import { createAdminController } from "./controllers/users.create-admin.controller";
import { listAdminsController } from "./controllers/users.list-admins.controller";

// authenticate + role check handled once in super-admin.routes.ts, the
// router this is mounted under - see that file's comment for why.
export const usersRouter: Router = Router();

usersRouter.post("/admins", validate(createAdminDto), createAdminController);

usersRouter.get("/admins", validate(listAdminsDto, "query"), listAdminsController);
