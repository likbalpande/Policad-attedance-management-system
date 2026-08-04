import { Router } from "express";
import { USER_ROLE } from "@platform/permissions";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { requireRole } from "../../middlewares/require-role.middleware";
import { organizationsRouter } from "./organizations/organizations.routes";
import { usersRouter } from "./users/users.routes";

// authenticate + requireRole(SUPER_ADMIN) applied once here, not per-route
// inside organizations.routes.ts/users.routes.ts - every route nested under
// this router is permanently super_admin-only/non-delegable (platform-level
// actions like creating an organization aren't scoped to any org/batch/course
// a delegated user could act within, so they're deliberately excluded from
// the checkPermission(id)/PERMISSIONS delegable-permission-catalog system -
// see the architecture skill's "Auth & RBAC middleware" section).
export const superAdminRouter: Router = Router();

superAdminRouter.use(authenticate, requireRole(USER_ROLE.SUPER_ADMIN));
superAdminRouter.use("/organizations", organizationsRouter);
superAdminRouter.use("/users", usersRouter);
