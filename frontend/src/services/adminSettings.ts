import { authService } from "./auth";
import { api } from "./api";
import type { User } from "./auth";

export interface WebsiteSettings {
  site_name: string;
  site_tagline: string;
  currency: string;
  free_shipping_threshold: number;
}

async function getToken(): Promise<string> {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const adminSettingsService = {
  async getProfile(): Promise<User> {
    return api.get<User>("/admin/settings/profile", await getToken());
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put<User>("/admin/settings/profile", data, await getToken());
  },

  async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
    return api.put<{ message: string }>(
      "/admin/settings/password",
      { current_password, new_password },
      await getToken(),
    );
  },

  async getWebsite(): Promise<WebsiteSettings> {
    return api.get<WebsiteSettings>("/admin/settings/website", await getToken());
  },

  async updateWebsite(data: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    return api.put<WebsiteSettings>("/admin/settings/website", data, await getToken());
  },
};
