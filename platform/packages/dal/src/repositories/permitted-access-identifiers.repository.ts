import { eq } from "drizzle-orm";
import { adminAccessIdentifiers, adminPermittedAccessIdentifiers, type DbClient } from "@platform/db";
import type { PermissionScope } from "@platform/permissions";
import { withSpan } from "@platform/tracing";
import { getDb } from "../client";
import type { AccessIdentifierRow } from "./access-identifiers.repository";

export type PermittedAccessIdentifierRow = typeof adminPermittedAccessIdentifiers.$inferSelect;

const DB_SPAN_ATTRS = {
  "db.system": "postgresql",
  "db.sql.table": "admin_permitted_access_identifiers",
} as const;

// Caller (permission-config-groups service) is responsible for validating
// that the group exists and that every access identifier's own `type`
// matches `type` before calling this - the composite FKs would reject a
// mismatch anyway, but that validation belongs at the service layer so it
// surfaces as a clean 400/404 instead of a raw FK-violation error.
export async function addAccessIdentifiersToGroup(
  permissionConfigGroupId: number,
  type: PermissionScope,
  accessIdentifierIds: number[],
): Promise<PermittedAccessIdentifierRow[]> {
  return withSpan(
    "db.permittedAccessIdentifiers.addAccessIdentifiersToGroup",
    async () => {
      const db: DbClient = getDb();
      return db
        .insert(adminPermittedAccessIdentifiers)
        .values(
          accessIdentifierIds.map((accessIdentifierId) => ({
            permissionConfigGroupId,
            accessIdentifierId,
            type,
          })),
        )
        .returning();
    },
    DB_SPAN_ATTRS,
  );
}

export async function listAccessIdentifiersForGroup(
  permissionConfigGroupId: number,
): Promise<AccessIdentifierRow[]> {
  return withSpan(
    "db.permittedAccessIdentifiers.listAccessIdentifiersForGroup",
    async () => {
      const db: DbClient = getDb();
      const rows = await db
        .select({ accessIdentifier: adminAccessIdentifiers })
        .from(adminPermittedAccessIdentifiers)
        .innerJoin(
          adminAccessIdentifiers,
          eq(adminPermittedAccessIdentifiers.accessIdentifierId, adminAccessIdentifiers.id),
        )
        .where(eq(adminPermittedAccessIdentifiers.permissionConfigGroupId, permissionConfigGroupId));
      return rows.map((row) => row.accessIdentifier);
    },
    DB_SPAN_ATTRS,
  );
}
