import type { AccessIdentifierRow } from "@platform/dal";
import type { AccessIdentifier } from "@platform/types";

export function serializeAccessIdentifier(row: AccessIdentifierRow): AccessIdentifier {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
