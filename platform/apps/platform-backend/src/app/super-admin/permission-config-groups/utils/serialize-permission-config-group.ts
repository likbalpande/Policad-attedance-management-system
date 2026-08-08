import type { PermissionConfigGroupRow, PermittedAccessIdentifierRow } from "@platform/dal";
import type { PermissionConfigGroup, PermittedAccessIdentifier } from "@platform/types";

export function serializePermissionConfigGroup(row: PermissionConfigGroupRow): PermissionConfigGroup {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export function serializePermittedAccessIdentifier(
  row: PermittedAccessIdentifierRow,
): PermittedAccessIdentifier {
  return { ...row, createdAt: row.createdAt.toISOString() };
}
