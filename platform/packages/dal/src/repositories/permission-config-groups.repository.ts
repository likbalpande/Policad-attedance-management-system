import { eq } from "drizzle-orm";
import { adminPermissionsConfigGroups, type DbClient } from "@platform/db";
import type { PermissionScope } from "@platform/permissions";
import { withSpan } from "@platform/tracing";
import { getDb } from "../client";

export type PermissionConfigGroupRow = typeof adminPermissionsConfigGroups.$inferSelect;
type NewPermissionConfigGroupInput = typeof adminPermissionsConfigGroups.$inferInsert;

// No soft-delete column on this table - see the same note in
// access-identifiers.repository.ts.
const DB_SPAN_ATTRS = {
  "db.system": "postgresql",
  "db.sql.table": "admin_permissions_config_groups",
} as const;

export async function createPermissionConfigGroup(
  input: NewPermissionConfigGroupInput,
): Promise<PermissionConfigGroupRow> {
  return withSpan(
    "db.permissionConfigGroups.createPermissionConfigGroup",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db.insert(adminPermissionsConfigGroups).values(input).returning();
      if (!row) throw new Error("Failed to create permission config group");
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function listPermissionConfigGroups(
  type?: PermissionScope,
): Promise<PermissionConfigGroupRow[]> {
  return withSpan(
    "db.permissionConfigGroups.listPermissionConfigGroups",
    async () => {
      const db: DbClient = getDb();
      return db
        .select()
        .from(adminPermissionsConfigGroups)
        .where(type !== undefined ? eq(adminPermissionsConfigGroups.type, type) : undefined);
    },
    DB_SPAN_ATTRS,
  );
}

export async function findPermissionConfigGroupById(
  id: number,
): Promise<PermissionConfigGroupRow | undefined> {
  return withSpan(
    "db.permissionConfigGroups.findPermissionConfigGroupById",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db
        .select()
        .from(adminPermissionsConfigGroups)
        .where(eq(adminPermissionsConfigGroups.id, id))
        .limit(1);
      return row;
    },
    DB_SPAN_ATTRS,
  );
}
