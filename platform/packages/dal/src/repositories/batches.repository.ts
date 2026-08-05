import { and, eq } from "drizzle-orm";
import { batches, type DbClient } from "@platform/db";
import { withSpan } from "@platform/tracing";
import { getDb } from "../client";

export type BatchRow = typeof batches.$inferSelect;
type NewBatchInput = typeof batches.$inferInsert;
type BatchPatch = Partial<Pick<BatchRow, "title" | "alias" | "isArchived">>;

// Soft-deleted rows are excluded by default everywhere in this repository -
// see the same note in users.repository.ts. Every read/write is also scoped
// by orgId (not just id) so a guessed id can never reach a batch in a
// different org.
const DB_SPAN_ATTRS = { "db.system": "postgresql", "db.sql.table": "batches" } as const;

export async function createBatch(input: NewBatchInput): Promise<BatchRow> {
    return withSpan(
        "db.batches.createBatch",
        async () => {
            const db: DbClient = getDb();
            const [row] = await db.insert(batches).values(input).returning();
            if (!row) throw new Error("Failed to create batch");
            return row;
        },
        DB_SPAN_ATTRS
    );
}

// TODO: Add a cache here for 2 minutes.
// It will be invalidated on any changes to batch or faculties in the batch or their permissions (in the org).
export async function listBatches(orgId: number): Promise<BatchRow[]> {
    return withSpan(
        "db.batches.listBatches",
        async () => {
            const db: DbClient = getDb();
            return db
                .select()
                .from(batches)
                .where(and(eq(batches.orgId, orgId), eq(batches.isDeleted, false)));
        },
        DB_SPAN_ATTRS
    );
}

export async function findBatchById(id: number, orgId: number): Promise<BatchRow | undefined> {
    return withSpan(
        "db.batches.findBatchById",
        async () => {
            const db: DbClient = getDb();
            const [row] = await db
                .select()
                .from(batches)
                .where(and(eq(batches.id, id), eq(batches.orgId, orgId), eq(batches.isDeleted, false)))
                .limit(1);
            return row;
        },
        DB_SPAN_ATTRS
    );
}

export async function updateBatch(id: number, orgId: number, patch: BatchPatch): Promise<BatchRow | undefined> {
    return withSpan(
        "db.batches.updateBatch",
        async () => {
            const db: DbClient = getDb();
            const [row] = await db
                .update(batches)
                .set({ ...patch, updatedAt: new Date() })
                .where(and(eq(batches.id, id), eq(batches.orgId, orgId), eq(batches.isDeleted, false)))
                .returning();
            return row;
        },
        DB_SPAN_ATTRS
    );
}

export async function softDeleteBatch(id: number, orgId: number): Promise<BatchRow | undefined> {
    return withSpan(
        "db.batches.softDeleteBatch",
        async () => {
            const db: DbClient = getDb();
            const [row] = await db
                .update(batches)
                .set({ isDeleted: true, updatedAt: new Date() })
                .where(and(eq(batches.id, id), eq(batches.orgId, orgId), eq(batches.isDeleted, false)))
                .returning();
            return row;
        },
        DB_SPAN_ATTRS
    );
}
