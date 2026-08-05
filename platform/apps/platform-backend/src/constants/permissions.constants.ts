import { PERMISSION_SCOPE, USER_ROLE, type UserRole, type PermissionScope } from "@platform/permissions";

// Every DELEGABLE API gets a unique permission identifier here (product-idea.txt:
// "For each API, a unique permission identifier is kept in a constants
// file"). Delegable = could ever be granted to a role via a permission
// config group (P_O/P_B/P_C), which by definition means it's scoped to a
// specific org/batch/course a delegated user acts within. Permanently
// platform-level, non-delegable actions (e.g. everything under
// app/super-admin/ - create an organization, create an admin) do NOT belong
// here; they use requireRole() instead (see require-role.middleware.ts) and
// are intentionally excluded from this catalog - see the architecture
// skill's "Auth & RBAC middleware" section for the full reasoning.
//
// - identifier duplicates the entry's own object key on purpose, so call
//   sites reference it as PERMISSIONS.SOME_ID.identifier instead of
//   retyping the string literal. The one risk this reintroduces - identifier
//   drifting from the key it's nested under, e.g. via a copy-pasted entry -
//   is caught by the consistency check below, once, at module load. This
//   same string must also match the `identifier` column of whichever
//   admin_access_identifiers row a permissions-config admin creates for it -
//   that link is hand-kept-in-sync too, there's no FK/type enforcing it.
// - route.basePath / route.path mirror the app's actual two-tier route
//   mounting (basePath = the prefix app.ts mounts the module's router under,
//   path = the route-local path inside that router's *.routes.ts) rather
//   than one hand-typed full path - keeps each half easy to eyeball against
//   the file that actually defines it, even though neither half is derived
//   automatically (still hand-kept-in-sync, just a smaller drift surface).
// - resourceType is the PermissionScope (general/batch/course/org) the
//   resource-scoped check (via user_permissions ->
//   admin_permitted_access_identifiers, see
//   userPermissionsRepository.userHasAccessIdentifier) validates against.
//   Every entry here has one - there's no "null" case: a delegable
//   permission with no specific resource dependency uses
//   PERMISSION_SCOPE.GENERAL (the ungrouped bucket), not null. A permission
//   with no resourceType at all isn't delegable, which means it doesn't
//   belong in this catalog in the first place - see requireRole() above.
// - bypassRoles is the role-based bypass mechanism ("There will be a bypass
//   mechanism in the validation middleware based on role an action... kept
//   in a constant file") - a role listed here skips the resource-scoped
//   P_O/P_B/P_C check entirely for this permission id. A permission whose
//   bypassRoles already covers every role that could ever call its route
//   (e.g. a view/list endpoint open to every staff role) still belongs here
//   rather than on requireRole() - see BATCH_LIST/BATCH_GET below - so
//   "every API checks a permission identifier" holds structurally even
//   though the resource-scoped path never actually runs for it.
interface PermissionDefinition {
    identifier: string;
    route: {
        method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
        basePath: string;
        path: string;
    };
    description: string;
    resourceType: PermissionScope;
    bypassRoles: UserRole[];
}

export const PERMISSIONS = {
    BATCH_CREATE: {
        identifier: "BATCH_CREATE",
        route: { method: "POST", basePath: "/api/v1/batches", path: "/" },
        description: "Create a batch in the caller's organization",
        resourceType: PERMISSION_SCOPE.ORG,
        bypassRoles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN],
    },
    BATCH_UPDATE: {
        identifier: "BATCH_UPDATE",
        route: { method: "PATCH", basePath: "/api/v1/batches", path: "/:id" },
        description: "Update a specific batch",
        resourceType: PERMISSION_SCOPE.BATCH,
        bypassRoles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN],
    },
    BATCH_LIST: {
        identifier: "BATCH_LIST",
        route: { method: "GET", basePath: "/api/v1/batches", path: "/" },
        description: "List batches in the caller's organization",
        resourceType: PERMISSION_SCOPE.ORG,
        bypassRoles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN],
    },
    BATCH_GET: {
        identifier: "BATCH_GET",
        route: { method: "GET", basePath: "/api/v1/batches", path: "/:id" },
        description: "Get a specific batch in the caller's organization",
        resourceType: PERMISSION_SCOPE.ORG,
        bypassRoles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN],
    },
} as const satisfies Record<string, PermissionDefinition>;

export type PermissionId = keyof typeof PERMISSIONS;

// Fail fast (at process startup, not per-request) if an entry's identifier
// ever drifts from its own key.
for (const [key, definition] of Object.entries(PERMISSIONS) as [string, PermissionDefinition][]) {
    if (definition.identifier !== key) {
        throw new Error(`PERMISSIONS["${key}"].identifier ("${definition.identifier}") does not match its own key`);
    }
}
