import { useAuthStore } from "@/stores/auth.store";
import { authStorage } from "@/lib/auth-storage";
import { router } from "@/routes/router";
import { ROUTE_PATHS } from "@/routes/route-paths";

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const logout = async () => {
    useAuthStore.getState().clearSession();
    await authStorage.clearTokens();
    router.navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  return { status, user, isAuthenticated: status === "authenticated", logout };
}
