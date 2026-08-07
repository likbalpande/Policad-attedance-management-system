import { Preferences } from "@capacitor/preferences";

const ACCESS_TOKEN_KEY = "ft.auth.accessToken";
const REFRESH_TOKEN_KEY = "ft.auth.refreshToken";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export const authStorage = {
  async getTokens(): Promise<StoredTokens | null> {
    const [{ value: accessToken }, { value: refreshToken }] = await Promise.all([
      Preferences.get({ key: ACCESS_TOKEN_KEY }),
      Preferences.get({ key: REFRESH_TOKEN_KEY })
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  async setTokens(tokens: StoredTokens): Promise<void> {
    await Promise.all([
      Preferences.set({ key: ACCESS_TOKEN_KEY, value: tokens.accessToken }),
      Preferences.set({ key: REFRESH_TOKEN_KEY, value: tokens.refreshToken })
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: ACCESS_TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_TOKEN_KEY })
    ]);
  }
};
