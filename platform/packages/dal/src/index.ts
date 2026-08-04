export * from "./client";
export * as usersRepository from "./repositories/users.repository";
export * as organizationsRepository from "./repositories/organizations.repository";
export * as accessIdentifiersRepository from "./repositories/access-identifiers.repository";
export * as permissionConfigGroupsRepository from "./repositories/permission-config-groups.repository";
export * as permittedAccessIdentifiersRepository from "./repositories/permitted-access-identifiers.repository";
// Row types - re-exported at the top level (not just reachable as
// usersRepository.UserRow) since app-layer code needs them for its own
// derived types (e.g. PB's SafeUser = Omit<UserRow, "password" | ...>).
export type { UserRow } from "./repositories/users.repository";
export type { AccessIdentifierRow } from "./repositories/access-identifiers.repository";
export type { PermissionConfigGroupRow } from "./repositories/permission-config-groups.repository";
// Constraint constants - single source of truth lives in @platform/db's
// schema files, re-exported here so services can match caught unique-
// violation errors without duplicating the string literals or importing
// @platform/db directly (only this package may do that). Each entry is a
// { key, message } pair (constraint name + its user-facing conflict
// message) - pass the whole <TABLE>_CONSTRAINTS object to @platform/http's
// assertNoUniqueViolation.
export {
  ORGANIZATIONS_CONSTRAINTS,
  USERS_CONSTRAINTS,
  ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS,
  ADMIN_PERMISSIONS_CONFIG_GROUPS_CONSTRAINTS,
  ADMIN_PERMITTED_ACCESS_IDENTIFIERS_CONSTRAINTS,
  USER_PERMISSIONS_CONSTRAINTS,
  BATCHES_CONSTRAINTS,
  BATCH_STUDENTS_CONSTRAINTS,
  COURSES_CONSTRAINTS,
  COURSE_BATCH_CONSTRAINTS,
  COURSE_SESSIONS_CONSTRAINTS,
  COURSE_TAG_MAP_CONSTRAINTS,
  BATCH_TAG_MAP_CONSTRAINTS,
  ATTENDANCES_CONSTRAINTS,
} from "@platform/db";
