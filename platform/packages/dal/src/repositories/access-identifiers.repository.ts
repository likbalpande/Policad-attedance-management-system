import { eq, inArray } from "drizzle-orm";
import { adminAccessIdentifiers, type DbClient } from "@platform/db";
import type { PermissionScope } from "@platform/permissions";
import { withSpan } from "@platform/tracing";
import { getDb } from "../client";

export type AccessIdentifierRow = typeof adminAccessIdentifiers.$inferSelect;
type NewAccessIdentifierInput = typeof adminAccessIdentifiers.$inferInsert;

// No soft-delete column on this table (unlike users/organizations) - a
// deleted-in-place catalog entry would silently break any
// admin_permitted_access_identifiers row already referencing it via its
// composite FK, so deletion isn't supported at all yet.
const DB_SPAN_ATTRS = {
  "db.system": "postgresql",
  "db.sql.table": "admin_access_identifiers",
} as const;

export async function createAccessIdentifier(
  input: NewAccessIdentifierInput,
): Promise<AccessIdentifierRow> {
  return withSpan(
    "db.accessIdentifiers.createAccessIdentifier",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db.insert(adminAccessIdentifiers).values(input).returning();
      if (!row) throw new Error("Failed to create access identifier");
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function listAccessIdentifiers(
  type?: PermissionScope,
): Promise<AccessIdentifierRow[]> {
  return withSpan(
    "db.accessIdentifiers.listAccessIdentifiers",
    async () => {
      const db: DbClient = getDb();
      return db
        .select()
        .from(adminAccessIdentifiers)
        .where(type !== undefined ? eq(adminAccessIdentifiers.type, type) : undefined);
    },
    DB_SPAN_ATTRS,
  );
}

// Used to validate a permission-config-group attach request: every id must
// exist, and the caller cross-checks each row's `type` against the target
// group's type before inserting (see permission-config-groups service).
export async function findAccessIdentifiersByIds(
  ids: number[],
): Promise<AccessIdentifierRow[]> {
  return withSpan(
    "db.accessIdentifiers.findAccessIdentifiersByIds",
    async () => {
      if (ids.length === 0) return [];
      const db: DbClient = getDb();
      return db
        .select()
        .from(adminAccessIdentifiers)
        .where(inArray(adminAccessIdentifiers.id, ids));
    },
    DB_SPAN_ATTRS,
  );
}
