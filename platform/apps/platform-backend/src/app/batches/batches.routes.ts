import { Router } from "express";
import { validate } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { requireRole } from "../../middlewares/require-role.middleware";
import { checkPermission } from "../../middlewares/check-permission.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { createBatchDto } from "./dto/create-batch.dto";
import { updateBatchDto } from "./dto/update-batch.dto";
import { batchIdParamsDto } from "./dto/batch-id.params.dto";
import { createBatchController } from "./controllers/batches.create.controller";
import { listBatchesController } from "./controllers/batches.list.controller";
import { getBatchController } from "./controllers/batches.get.controller";
import { updateBatchController } from "./controllers/batches.update.controller";
import { deleteBatchController } from "./controllers/batches.delete.controller";

// Standalone module router (not nested under an actor-tier aggregator like
// super-admin.routes.ts) - authorization differs per route AND per role on
// these same routes (admin bypasses, faculty needs a grant, checked via
// checkPermission), so there's no single blunt gate to hoist to a parent.
// Delete is the one exception - confirmed admin-only/non-delegable, so it
// uses requireRole directly instead.
export const batchesRouter: Router = Router();

batchesRouter.use(authenticate);

batchesRouter.post(
  "/",
  checkPermission(PERMISSIONS.BATCH_CREATE.identifier),
  validate(createBatchDto),
  createBatchController,
);

batchesRouter.get("/", checkPermission(PERMISSIONS.BATCH_LIST.identifier), listBatchesController);

batchesRouter.get(
  "/:id",
  validate(batchIdParamsDto, "params"),
  checkPermission(PERMISSIONS.BATCH_GET.identifier),
  getBatchController,
);

batchesRouter.patch(
  "/:id",
  validate(batchIdParamsDto, "params"),
  checkPermission(PERMISSIONS.BATCH_UPDATE.identifier, (req) => Number(req.params.id)),
  validate(updateBatchDto),
  updateBatchController,
);

batchesRouter.delete(
  "/:id",
  validate(batchIdParamsDto, "params"),
  requireRole(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  deleteBatchController,
);
