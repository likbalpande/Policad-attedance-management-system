import axios from "axios";
import { env } from "@/config/env.config";
import { useAuthStore } from "@/stores/auth.store";
import { handleUnauthorized } from "@/lib/auth-refresh";

/**
 * Genuinely unused this pass - LAG has no endpoints implemented yet. Scaffolded
 * now per frontend-setup.txt's two-axios-instance architecture so future
 * attendance-marking code has a client to import instead of adding one ad-hoc.
 */
export const lagClient = axios.create({ baseURL: env.VITE_LAG_API_BASE_URL });

lagClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

lagClient.interceptors.response.use(
  (response) => response,
  (error) => handleUnauthorized(lagClient, error)
);
