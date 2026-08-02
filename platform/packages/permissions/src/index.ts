// Mirrors admin_access_identifiers.type / admin_permissions_config_groups.type
// (application_level_enum in table-structure.txt) - P_O/P_B/P_C plus the
// ungrouped "general" bucket.
export const PERMISSION_SCOPE = {
    GENERAL: "general",
    BATCH: "batch",
    COURSE: "course",
    ORG: "org",
} as const;
export type PermissionScope = (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE];

// Mirrors users.role (application_level_enum in table-structure.txt).
export const USER_ROLE = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    FACULTY: "faculty",
    STUDENT: "student",
} as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
