import { Router } from "express";
import { validate } from "@platform/http";
import { createOrganizationDto } from "./dto/create-organizations.dto";
import { createOrganizationController } from "./controllers/organizations.create.controller";
import { listOrganizationsController } from "./controllers/organizations.list.controller";

// authenticate + role check handled once in super-admin.routes.ts, the
// router this is mounted under - see that file's comment for why.
export const organizationsRouter: Router = Router();

organizationsRouter.post("/", validate(createOrganizationDto), createOrganizationController);

organizationsRouter.get("/", listOrganizationsController);
