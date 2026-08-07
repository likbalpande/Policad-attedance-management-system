import { createBrowserRouter, redirect, Outlet } from "react-router-dom";
import { USER_ROLE } from "@platform/permissions";
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
        lazy: () =>
          import("@/app/super-admin/dashboard/pages/super-admin-dashboard.page").then((m) => ({
            Component: m.default
          }))
      },
      {
        path: ROUTE_PATHS.STAFF,
        loader: requireRole(USER_ROLE.ADMIN, USER_ROLE.FACULTY),
        lazy: () => import("@/app/staff/dashboard/pages/staff-dashboard.page").then((m) => ({ Component: m.default }))
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
