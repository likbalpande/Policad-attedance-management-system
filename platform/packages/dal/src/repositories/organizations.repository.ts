import { eq, and } from "drizzle-orm";
import { organizations, type DbClient } from "@platform/db";
import { withSpan } from "@platform/tracing";
import { getDb } from "../client";

type OrganizationRow = typeof organizations.$inferSelect;
type NewOrganizationInput = typeof organizations.$inferInsert;

// Soft-deleted rows are excluded by default everywhere in this repository -
// see the same note in users.repository.ts. Every function is wrapped in
// withSpan() for the same reason as users.repository.ts - no auto-
// instrumentation exists for the `postgres` driver.
const DB_SPAN_ATTRS = { "db.system": "postgresql", "db.sql.table": "organizations" } as const;

export async function createOrganization(
  input: NewOrganizationInput,
): Promise<OrganizationRow> {
  return withSpan(
    "db.organizations.createOrganization",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db.insert(organizations).values(input).returning();
      if (!row) throw new Error("Failed to create organization");
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function findOrganizationById(id: number): Promise<OrganizationRow | undefined> {
  return withSpan(
    "db.organizations.findOrganizationById",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db
        .select()
        .from(organizations)
        .where(and(eq(organizations.id, id), eq(organizations.isDeleted, false)))
        .limit(1);
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function findOrganizationByName(
  name: string,
): Promise<OrganizationRow | undefined> {
  return withSpan(
    "db.organizations.findOrganizationByName",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db
        .select()
        .from(organizations)
        .where(and(eq(organizations.name, name), eq(organizations.isDeleted, false)))
        .limit(1);
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function listOrganizations(): Promise<OrganizationRow[]> {
  return withSpan(
    "db.organizations.listOrganizations",
    async () => {
      const db: DbClient = getDb();
      return db.select().from(organizations).where(eq(organizations.isDeleted, false));
    },
    DB_SPAN_ATTRS,
  );
}
