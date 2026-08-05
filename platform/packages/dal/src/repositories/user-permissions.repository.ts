import { and, eq, inArray, isNull } from "drizzle-orm";
import { adminAccessIdentifiers, adminPermittedAccessIdentifiers, userPermissions, type DbClient } from "@platform/db";
import type { PermissionScope } from "@platform/permissions";
import { withSpan } from "@platform/tracing";
import { getDb } from "../client";

export type UserPermissionRow = typeof userPermissions.$inferSelect;
type NewUserPermissionInput = typeof userPermissions.$inferInsert;

const DB_SPAN_ATTRS = { "db.system": "postgresql", "db.sql.table": "user_permissions" } as const;

export async function grantPermission(input: NewUserPermissionInput): Promise<UserPermissionRow> {
    return withSpan(
        "db.userPermissions.grantPermission",
        async () => {
            const db: DbClient = getDb();
            const [row] = await db.insert(userPermissions).values(input).returning();
            if (!row) throw new Error("Failed to grant permission");
            return row;
        },
        DB_SPAN_ATTRS
    );
}

export async function listPermissionsForUser(userId: number): Promise<UserPermissionRow[]> {
    return withSpan(
        "db.userPermissions.listPermissionsForUser",
        async () => {
            const db: DbClient = getDb();
            return db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
        },
        DB_SPAN_ATTRS
    );
}

// The core resource-scoped RBAC check: does `userId` hold a grant (via some
// permission-config-group) for `identifier`/`type`, scoped to `resourceId`
// (or ungrouped, when `resourceId` is null - PERMISSION_SCOPE.GENERAL)?
// `user_permissions.resourceType` is already DB-constrained to match its
// config group's `type` via that table's own composite FK, so this join
// doesn't need to re-verify that leg - only the access-identifier's own
// `identifier`/`type` need checking against what the caller asked for.

// TODO: Need to add cache on top of it.
// Invalidate it when any access_identifiers are changed related to that user.
// Or a TTL of 2 minutes.
export async function userHasAccessIdentifier(params: {
    userId: number;
    identifier: string;
    type: PermissionScope;
    resourceId: number | null;
}): Promise<boolean> {
    return withSpan(
        "db.userPermissions.userHasAccessIdentifier",
        async () => {
            const db: DbClient = getDb();
            const [row] = await db
                .select({ id: userPermissions.id })
                .from(userPermissions)
                .innerJoin(
                    adminPermittedAccessIdentifiers,
                    eq(
                        userPermissions.adminPermissionsConfigGroupId,
                        adminPermittedAccessIdentifiers.permissionConfigGroupId
                    )
                )
                .innerJoin(
                    adminAccessIdentifiers,
                    eq(adminPermittedAccessIdentifiers.accessIdentifierId, adminAccessIdentifiers.id)
                )
                .where(
                    and(
                        eq(userPermissions.userId, params.userId),
                        eq(userPermissions.resourceType, params.type),
                        params.resourceId === null
                            ? isNull(userPermissions.resourceId)
                            : eq(userPermissions.resourceId, params.resourceId),
                        eq(adminAccessIdentifiers.identifier, params.identifier),
                        eq(adminAccessIdentifiers.type, params.type)
                    )
                )
                .limit(1);
            return row !== undefined;
        },
        DB_SPAN_ATTRS
    );
}

// Bulk variant of userHasAccessIdentifier's join for one specific
// identifier across many resources (e.g. "which of these batch ids does
// each faculty have BATCH_UPDATE on" for a whole list response), instead of
// one query per (resource, user) pair. Returns every (resourceId, userId)
// pair holding that grant.
export async function listGranteeIdsForAccessIdentifier(params: {
    identifier: string;
    type: PermissionScope;
    resourceIds: number[];
}): Promise<{ resourceId: number; userId: number }[]> {
    if (params.resourceIds.length === 0) return [];
    return withSpan(
        "db.userPermissions.listGranteeIdsForAccessIdentifier",
        async () => {
            const db: DbClient = getDb();
            const rows = await db
                .select({
                    resourceId: userPermissions.resourceId,
                    userId: userPermissions.userId,
                })
                .from(userPermissions)
                .innerJoin(
                    adminPermittedAccessIdentifiers,
                    eq(
                        userPermissions.adminPermissionsConfigGroupId,
                        adminPermittedAccessIdentifiers.permissionConfigGroupId
                    )
                )
                .innerJoin(
                    adminAccessIdentifiers,
                    eq(adminPermittedAccessIdentifiers.accessIdentifierId, adminAccessIdentifiers.id)
                )
                .where(
                    and(
                        eq(userPermissions.resourceType, params.type),
                        inArray(userPermissions.resourceId, params.resourceIds),
                        eq(adminAccessIdentifiers.identifier, params.identifier)
                    )
                );
            // resourceId is nullable in the schema (general-scoped grants carry
            // none), but every row here is resourceType-filtered to `type`, and
            // BATCH/COURSE/ORG grants always have a resourceId (validated at
            // grant time - see user-permissions.grant.service.ts). This filter
            // is only to satisfy the column's nullable type, not a real case.
            return rows.filter((row): row is { resourceId: number; userId: number } => row.resourceId !== null);
        },
        DB_SPAN_ATTRS
    );
}
