import type { OrganizationRow } from "@platform/dal";
import type { Organization } from "@platform/types";

// PB's DAL row has Date objects for timestamps; the shared Organization type
// is the wire (post-JSON) shape, so every response-producing service formats
// through this before returning - keeps the Promise<Organization> return-type
// annotation on those services literally true, not just structurally close.
// Parameter typed against the real DAL row (not a hand-copied field list) so
// a column rename/removal breaks this function's compile, not just silently
// drifts - excess-property checks don't catch that on a typed variable, only
// matching the real row type does.
export function serializeOrganization(row: OrganizationRow): Organization {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
