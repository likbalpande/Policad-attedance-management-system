import type { UserRole, PermissionScope } from "@platform/permissions";

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
// Empty for now - no delegable module exists yet. The next module whose
// routes can genuinely be granted to an admin/faculty via a permission
// config group (e.g. course/batch-scoped actions) populates this.
//
// - identifier duplicates the entry's own object key on purpose, so call
//   sites reference it as PERMISSIONS.SOME_ID.identifier instead of
//   retyping the string literal. The one risk this reintroduces - identifier
//   drifting from the key it's nested under, e.g. via a copy-pasted entry -
//   is caught by the consistency check below, once, at module load.
// - route.basePath / route.path mirror the app's actual two-tier route
//   mounting (basePath = the prefix app.ts mounts the module's router under,
//   path = the route-local path inside that router's *.routes.ts) rather
//   than one hand-typed full path - keeps each half easy to eyeball against
//   the file that actually defines it, even though neither half is derived
//   automatically (still hand-kept-in-sync, just a smaller drift surface).
// - resourceType is the PermissionScope (general/batch/course/org) the
//   eventual resource-scoped check (via admin_permitted_access_identifiers)
//   will validate against. Every entry here has one - there's no "null"
//   case: a delegable permission with no specific resource dependency uses
//   PERMISSION_SCOPE.GENERAL (the ungrouped bucket), not null. A permission
//   with no resourceType at all isn't delegable, which means it doesn't
//   belong in this catalog in the first place - see requireRole() above.
// - bypassRoles is the role-based bypass mechanism ("There will be a bypass
//   mechanism in the validation middleware based on role an action... kept
//   in a constant file") - a role listed here skips the resource-scoped
//   P_O/P_B/P_C check entirely for this permission id.
//
// Resource-scoped checking (against admin_permitted_access_identifiers) does
// not exist yet - see checkPermission.middleware.ts. Until it does, a role
// NOT in bypassRoles is denied outright rather than silently allowed.
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

export const PERMISSIONS = {} as const satisfies Record<string, PermissionDefinition>;

export type PermissionId = keyof typeof PERMISSIONS;

// Fail fast (at process startup, not per-request) if an entry's identifier
// ever drifts from its own key.
for (const [key, definition] of Object.entries(PERMISSIONS) as [string, PermissionDefinition][]) {
  if (definition.identifier !== key) {
    throw new Error(
      `PERMISSIONS["${key}"].identifier ("${definition.identifier}") does not match its own key`,
    );
  }
}
