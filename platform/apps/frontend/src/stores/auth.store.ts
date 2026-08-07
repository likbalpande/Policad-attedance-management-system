import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { StaffAccessTokenPayload } from "@platform/types";

export interface AuthUser {
  userId: number;
  orgId: number;
  role: StaffAccessTokenPayload["role"];
}

export interface AuthSessionTokens {
  accessToken: string;
  refreshToken: string;
}

type AuthStatus = "pending" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (tokens: AuthSessionTokens) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "pending",
  accessToken: null,
  refreshToken: null,
  user: null,

  setSession: (tokens) => {
    const payload = jwtDecode<StaffAccessTokenPayload>(tokens.accessToken);
    set({
      status: "authenticated",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { userId: payload.userId, orgId: payload.orgId, role: payload.role }
    });
  },

  clearSession: () => {
    set({ status: "unauthenticated", accessToken: null, refreshToken: null, user: null });
  }
}));
