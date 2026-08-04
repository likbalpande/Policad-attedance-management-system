import { Router } from "express";
import { validate } from "@platform/http";
import { createPermissionConfigGroupDto } from "./dto/create-permission-config-group.dto";
import { listPermissionConfigGroupsDto } from "./dto/list-permission-config-groups.dto";
import { addAccessIdentifiersDto } from "./dto/add-access-identifiers.dto";
import { permissionConfigGroupIdParamsDto } from "./dto/permission-config-group-id.params.dto";
import { createPermissionConfigGroupController } from "./controllers/permission-config-groups.create.controller";
import { listPermissionConfigGroupsController } from "./controllers/permission-config-groups.list.controller";
import { addAccessIdentifiersToGroupController } from "./controllers/permission-config-groups.add-access-identifiers.controller";
import { listAccessIdentifiersForGroupController } from "./controllers/permission-config-groups.list-access-identifiers.controller";

// authenticate + role check handled once in super-admin.routes.ts, the
// router this is mounted under - see that file's comment for why.
export const permissionConfigGroupsRouter: Router = Router();

permissionConfigGroupsRouter.post(
  "/",
  validate(createPermissionConfigGroupDto),
  createPermissionConfigGroupController,
);

permissionConfigGroupsRouter.get(
  "/",
  validate(listPermissionConfigGroupsDto, "query"),
  listPermissionConfigGroupsController,
);

permissionConfigGroupsRouter.post(
  "/:id/access-identifiers",
  validate(permissionConfigGroupIdParamsDto, "params"),
  validate(addAccessIdentifiersDto),
  addAccessIdentifiersToGroupController,
);

permissionConfigGroupsRouter.get(
  "/:id/access-identifiers",
  validate(permissionConfigGroupIdParamsDto, "params"),
  listAccessIdentifiersForGroupController,
);
