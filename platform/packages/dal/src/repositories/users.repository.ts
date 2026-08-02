import { eq, and, sql } from "drizzle-orm";
import { users, type DbClient } from "@platform/db";
import { withSpan } from "@platform/tracing";
import { getDb } from "../client";

type UserRow = typeof users.$inferSelect;
type NewUserInput = typeof users.$inferInsert;

// Soft-deleted rows are excluded by default everywhere in this repository -
// "deleted" means "doesn't exist" for every normal caller. A future
// admin-restore/audit feature that genuinely needs deleted rows should get
// its own explicitly-named function (e.g. findUserByIdIncludingDeleted),
// never make this the default.

// Every function is wrapped in withSpan() rather than relying on
// auto-instrumentation - the `postgres` driver we use (unlike `pg`) has no
// official OpenTelemetry instrumentation package.
const DB_SPAN_ATTRS = { "db.system": "postgresql", "db.sql.table": "users" } as const;

export async function findUserById(id: number): Promise<UserRow | undefined> {
  return withSpan(
    "db.users.findUserById",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), eq(users.isDeleted, false)))
        .limit(1);
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  return withSpan(
    "db.users.findUserByEmail",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.isDeleted, false)))
        .limit(1);
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function findUserByIdentifierAndOrg(
  identifier: string,
  orgId: number,
): Promise<UserRow | undefined> {
  return withSpan(
    "db.users.findUserByIdentifierAndOrg",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.identifier, identifier),
            eq(users.orgId, orgId),
            eq(users.isDeleted, false),
          ),
        )
        .limit(1);
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function createUser(input: NewUserInput): Promise<UserRow> {
  return withSpan(
    "db.users.createUser",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db.insert(users).values(input).returning();
      if (!row) throw new Error("Failed to create user");
      return row;
    },
    DB_SPAN_ATTRS,
  );
}

export async function setUserOtp(
  userId: number,
  otp: string,
  otpGeneratedAt: Date,
): Promise<void> {
  return withSpan(
    "db.users.setUserOtp",
    async () => {
      const db: DbClient = getDb();
      await db
        .update(users)
        .set({ otp, otpGeneratedAt, updatedAt: new Date() })
        .where(and(eq(users.id, userId), eq(users.isDeleted, false)));
    },
    DB_SPAN_ATTRS,
  );
}

export async function clearUserOtp(userId: number): Promise<void> {
  return withSpan(
    "db.users.clearUserOtp",
    async () => {
      const db: DbClient = getDb();
      await db
        .update(users)
        .set({ otp: null, otpGeneratedAt: null, updatedAt: new Date() })
        .where(and(eq(users.id, userId), eq(users.isDeleted, false)));
    },
    DB_SPAN_ATTRS,
  );
}

// Also stamps lastLoginAt - used by student login to detect a concurrent
// session (a previous lastLoginAt still within the access token TTL means a
// prior session could still be alive). See product-idea.txt.
export async function incrementLoginCount(userId: number): Promise<number> {
  return withSpan(
    "db.users.incrementLoginCount",
    async () => {
      const db: DbClient = getDb();
      const current = await findUserById(userId);
      if (!current) throw new Error(`User ${userId} not found`);
      const nextLoginCount = current.loginCount + 1;
      await db
        .update(users)
        .set({ loginCount: nextLoginCount, lastLoginAt: new Date(), updatedAt: new Date() })
        .where(and(eq(users.id, userId), eq(users.isDeleted, false)));
      return nextLoginCount;
    },
    DB_SPAN_ATTRS,
  );
}

// Also bumps loginCount (atomically, via SQL - no read-then-write needed
// here) - a password reset must invalidate any live session on its own,
// without waiting for the student to log in again. See product-idea.txt.
export async function updateUserPassword(
  userId: number,
  input: { password: string; passwordGeneratedAt: Date },
): Promise<void> {
  return withSpan(
    "db.users.updateUserPassword",
    async () => {
      const db: DbClient = getDb();
      await db
        .update(users)
        .set({
          password: input.password,
          passwordGeneratedAt: input.passwordGeneratedAt,
          loginCount: sql`${users.loginCount} + 1`,
          updatedAt: new Date(),
        })
        .where(and(eq(users.id, userId), eq(users.isDeleted, false)));
    },
    DB_SPAN_ATTRS,
  );
}

// Every successful student login burns the password just used and replaces
// it with a fresh random one in the same atomic UPDATE that bumps loginCount
// and stamps lastLoginAt - one query, so the returned loginCount can never
// drift from what actually landed in the DB (unlike a separate
// incrementLoginCount() call afterward, which would double-increment and
// immediately invalidate the token this login is about to issue). Applies to
// both the one-time creation password and every later admin-issued reset -
// see product-idea.txt's student login section.
export async function rotateStudentPasswordOnLogin(
  userId: number,
  newPassword: string,
): Promise<{ loginCount: number } | undefined> {
  return withSpan(
    "db.users.rotateStudentPasswordOnLogin",
    async () => {
      const db: DbClient = getDb();
      const [row] = await db
        .update(users)
        .set({
          password: newPassword,
          passwordGeneratedAt: new Date(),
          loginCount: sql`${users.loginCount} + 1`,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
        .returning({ loginCount: users.loginCount });
      return row;
    },
    DB_SPAN_ATTRS,
  );
}
