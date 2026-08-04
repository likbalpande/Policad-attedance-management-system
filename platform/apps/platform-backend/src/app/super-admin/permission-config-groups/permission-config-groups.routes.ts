import { Router } from "express";
import { validate } from "@platform/http";
import { createPermissionConfigGroupDto } from "./dto/create-permission-config-group.dto";
import { listPermissionConfigGroupsDto } from "./dto/list-permission-config-groups.dto";
import { addAccessIdentifiersDto } from "./dto/add-access-identifiers.dto";
import { permissionConfigGroupIdParamsDto } from "./dto/permission-config-group-id.params.dto";
import { removeAccessIdentifierParamsDto } from "./dto/remove-access-identifier.params.dto";
import { createPermissionConfigGroupController } from "./controllers/permission-config-groups.create.controller";
import { listPermissionConfigGroupsController } from "./controllers/permission-config-groups.list.controller";
import { addAccessIdentifiersToGroupController } from "./controllers/permission-config-groups.add-access-identifiers.controller";
import { removeAccessIdentifierFromGroupController } from "./controllers/permission-config-groups.remove-access-identifier.controller";

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

// Listing which access identifiers belong to a group lives on the
// access-identifiers module instead (GET /access-identifiers?
// permissionConfigGroupId=) - it's a filtered access-identifier read, not a
// group mutation, so it belongs with the resource it returns.
permissionConfigGroupsRouter.post(
  "/:id/access-identifiers",
  validate(permissionConfigGroupIdParamsDto, "params"),
  validate(addAccessIdentifiersDto),
  addAccessIdentifiersToGroupController,
);

permissionConfigGroupsRouter.delete(
  "/:id/access-identifiers/:accessIdentifierId",
  validate(removeAccessIdentifierParamsDto, "params"),
  removeAccessIdentifierFromGroupController,
);
