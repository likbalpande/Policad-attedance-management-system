import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { refreshTokens } from "@/api/auth/refresh.api";
import { useAuthStore } from "@/stores/auth.store";
import { authStorage } from "@/lib/auth-storage";
import { router } from "@/routes/router";
import { ROUTE_PATHS } from "@/routes/route-paths";

// Shared single-flight refresh, so a burst of concurrent 401s (from either
// pbClient or lagClient) triggers exactly one POST /auth/refresh call.
let refreshPromise: Promise<string> | null = null;
const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();

export async function handleUnauthorized(client: AxiosInstance, error: AxiosError) {
  const originalRequest = error.config;
  const status = error.response?.status;

  if (!originalRequest || status !== 401) {
    return Promise.reject(error);
  }

  const isRefreshCall = originalRequest.url?.includes("/auth/refresh");
  if (isRefreshCall) {
    await clearSessionAndRedirect();
    return Promise.reject(error);
  }

  if (retriedRequests.has(originalRequest)) {
    return Promise.reject(error);
  }
  retriedRequests.add(originalRequest);

  try {
    const accessToken = await getOrStartRefresh();
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return client(originalRequest);
  } catch (refreshError) {
    return Promise.reject(refreshError);
  }
}

function getOrStartRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function performRefresh(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) {
    await clearSessionAndRedirect();
    throw new Error("No refresh token available");
  }

  const { data } = await refreshTokens(refreshToken);
  useAuthStore.getState().setSession(data.data);
  await authStorage.setTokens(data.data);
  return data.data.accessToken;
}

async function clearSessionAndRedirect() {
  useAuthStore.getState().clearSession();
  await authStorage.clearTokens();
  router.navigate(ROUTE_PATHS.LOGIN, { replace: true });
}
