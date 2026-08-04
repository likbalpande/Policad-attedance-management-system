import { ConflictError } from "./errors";

// The `postgres` driver (porsager) throws errors shaped like raw Postgres
// error responses - code "23505" is unique_violation, constraint_name names
// the violated constraint. Kept here (not in @platform/dal) so every app's
// service layer can turn a caught insert/update failure into a ConflictError
// without each one re-deriving the shape.
interface PostgresErrorLike {
  code?: string;
  constraint_name?: string;
}

export function getUniqueViolationConstraint(err: unknown): string | undefined {
  const pgErr = err as PostgresErrorLike;
  if (pgErr?.code !== "23505") return undefined;
  return pgErr.constraint_name;
}

interface ConstraintEntry {
  key: string;
  message: string;
}

// Looks up the violated constraint against a caller-supplied <TABLE>_CONSTRAINTS
// object (each entry a { key, message } pair, defined in @platform/db's
// schema files and re-exported via @platform/dal) and throws ConflictError
// with the matching message. No-op (returns normally) if err isn't a unique
// violation or the constraint doesn't match any entry - caller is expected
// to rethrow err in that case.
export function assertNoUniqueViolation(
  err: unknown,
  constraints: Record<string, ConstraintEntry>,
): void {
  const constraintName = getUniqueViolationConstraint(err);
  if (!constraintName) return;
  const match = Object.values(constraints).find((entry) => entry.key === constraintName);
  if (match) {
    throw new ConflictError(match.message);
  }
}
