import { createBrowserRouter, redirect, Outlet } from "react-router-dom";
import { USER_ROLE } from "@platform/permissions";
import { AppShell } from "@/components/app-shell";
import { IconBatch, IconOrganization, IconPermission, IconUsers } from "@/components/icons";
import { ROUTE_PATHS } from "./route-paths";
import { requireRole, redirectIfAuthenticated } from "./guards";

function RootLayout() {
  return <Outlet />;
}

// The session is already rehydrated (see main.tsx) before this router is
// even constructed, so every loader below resolves synchronously - this
// fallback exists only to satisfy React Router's hydration API, it's never
// visibly shown.
function RootHydrateFallback() {
  return null;
}

function SuperAdminShell() {
  return (
    <AppShell
      title="Super Admin"
      navItems={[
        { label: "Organizations", to: ROUTE_PATHS.SUPER_ADMIN_ORGANIZATIONS, icon: <IconOrganization className="size-4" /> },
        { label: "Admins", to: ROUTE_PATHS.SUPER_ADMIN_ADMINS, icon: <IconUsers className="size-4" /> },
        { label: "Permissions", to: ROUTE_PATHS.SUPER_ADMIN_PERMISSIONS, icon: <IconPermission className="size-4" /> }
      ]}
    />
  );
}

function StaffShell() {
  return (
    <AppShell
      title="Staff"
      navItems={[{ label: "Batches", to: ROUTE_PATHS.STAFF_BATCHES, icon: <IconBatch className="size-4" /> }]}
    />
  );
}

export const router = createBrowserRouter([
  {
    id: "root",
    Component: RootLayout,
    HydrateFallback: RootHydrateFallback,
    children: [
      { index: true, Component: () => null, loader: () => redirect(ROUTE_PATHS.LOGIN) },
      {
        path: ROUTE_PATHS.LOGIN,
        loader: redirectIfAuthenticated,
        lazy: () => import("@/app/auth/staff-login/pages/staff-login.page").then((m) => ({ Component: m.default }))
      },
      {
        path: ROUTE_PATHS.SUPER_ADMIN,
        loader: requireRole(USER_ROLE.SUPER_ADMIN),
        Component: SuperAdminShell,
        children: [
          { index: true, Component: () => null, loader: () => redirect(ROUTE_PATHS.SUPER_ADMIN_ORGANIZATIONS) },
          {
            path: "organizations",
            lazy: () =>
              import("@/app/super-admin/organizations/pages/organizations.page").then((m) => ({ Component: m.default }))
          },
          {
            path: "admins",
            lazy: () => import("@/app/super-admin/admins/pages/admins.page").then((m) => ({ Component: m.default }))
          },
          {
            path: "permissions",
            lazy: () =>
              import("@/app/super-admin/permissions/pages/permissions.page").then((m) => ({ Component: m.default }))
          }
        ]
      },
      {
        path: ROUTE_PATHS.STAFF,
        loader: requireRole(USER_ROLE.ADMIN, USER_ROLE.FACULTY),
        Component: StaffShell,
        children: [
          { index: true, Component: () => null, loader: () => redirect(ROUTE_PATHS.STAFF_BATCHES) },
          {
            path: "batches",
            lazy: () => import("@/app/staff/batches/pages/batches.page").then((m) => ({ Component: m.default }))
          },
          {
            path: "batches/:id",
            lazy: () => import("@/app/staff/batches/pages/batch-detail.page").then((m) => ({ Component: m.default }))
          }
        ]
      },
      {
        path: ROUTE_PATHS.UNAUTHORIZED,
        lazy: () => import("@/app/shared/unauthorized/pages/unauthorized.page").then((m) => ({ Component: m.default }))
      },
      {
        path: "*",
        lazy: () => import("@/app/shared/not-found/pages/not-found.page").then((m) => ({ Component: m.default }))
      }
    ]
  }
]);
