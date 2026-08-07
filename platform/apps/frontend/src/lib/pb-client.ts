import axios from "axios";
import { env } from "@/config/env.config";
import { useAuthStore } from "@/stores/auth.store";
import { handleUnauthorized } from "@/lib/auth-refresh";

export const pbClient = axios.create({ baseURL: env.VITE_PB_API_BASE_URL });

pbClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

pbClient.interceptors.response.use(
  (response) => response,
  (error) => handleUnauthorized(pbClient, error)
);
