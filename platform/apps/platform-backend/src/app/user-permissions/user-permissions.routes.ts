import { Router } from "express";
import { validate } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { requireRole } from "../../middlewares/require-role.middleware";
import { grantUserPermissionDto } from "./dto/grant-user-permission.dto";
import { listUserPermissionsDto } from "./dto/list-user-permissions.dto";
import { grantUserPermissionController } from "./controllers/user-permissions.grant.controller";
import { listUserPermissionsController } from "./controllers/user-permissions.list.controller";

// Granting a permission is itself non-delegable (an admin/super_admin
// action, never delegated further) - requireRole, not checkPermission.
// Applied directly on this router (there's no actor-tier aggregator to
// carry it, unlike super-admin.routes.ts) since ADMIN must reach it too,
// not just SUPER_ADMIN.
export const userPermissionsRouter: Router = Router();

userPermissionsRouter.use(authenticate, requireRole(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN));

userPermissionsRouter.post("/", validate(grantUserPermissionDto), grantUserPermissionController);

userPermissionsRouter.get(
  "/",
  validate(listUserPermissionsDto, "query"),
  listUserPermissionsController,
);
