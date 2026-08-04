import { Router } from "express";
import { validate } from "@platform/http";
import { createAccessIdentifierDto } from "./dto/create-access-identifier.dto";
import { listAccessIdentifiersDto } from "./dto/list-access-identifiers.dto";
import { createAccessIdentifierController } from "./controllers/access-identifiers.create.controller";
import { listAccessIdentifiersController } from "./controllers/access-identifiers.list.controller";

// authenticate + role check handled once in super-admin.routes.ts, the
// router this is mounted under - see that file's comment for why.
export const accessIdentifiersRouter: Router = Router();

accessIdentifiersRouter.post("/", validate(createAccessIdentifierDto), createAccessIdentifierController);

accessIdentifiersRouter.get(
  "/",
  validate(listAccessIdentifiersDto, "query"),
  listAccessIdentifiersController,
);
