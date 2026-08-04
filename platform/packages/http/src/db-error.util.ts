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
