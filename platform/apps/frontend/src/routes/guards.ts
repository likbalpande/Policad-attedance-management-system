import { redirect, type LoaderFunction } from "react-router-dom";
import { USER_ROLE, type UserRole } from "@platform/permissions";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTE_PATHS } from "./route-paths";

function homePathFor(role: UserRole): string {
  switch (role) {
    case USER_ROLE.SUPER_ADMIN:
      return ROUTE_PATHS.SUPER_ADMIN;
    case USER_ROLE.ADMIN:
    case USER_ROLE.FACULTY:
      return ROUTE_PATHS.STAFF;
    case USER_ROLE.STUDENT:
      // Unreachable today - PB's /auth/staff/login rejects student accounts,
      // and student login isn't built in FT yet. Throws instead of silently
      // falling through to STAFF once this branch does become reachable.
      throw new Error("Student sessions don't have a home route in FT yet");
    default:
      return assertNeverRole(role);
  }
}

function assertNeverRole(role: never): never {
  throw new Error(`Unhandled role: ${String(role)}`);
}

export function requireRole(...roles: UserRole[]): LoaderFunction {
  return () => {
    const { status, user } = useAuthStore.getState();
    if (status !== "authenticated" || !user) {
      throw redirect(ROUTE_PATHS.LOGIN);
    }
    if (!roles.includes(user.role)) {
      throw redirect(ROUTE_PATHS.UNAUTHORIZED);
    }
    return null;
  };
}

export const redirectIfAuthenticated: LoaderFunction = () => {
  const { status, user } = useAuthStore.getState();
  if (status === "authenticated" && user) {
    throw redirect(homePathFor(user.role));
  }
  return null;
};
