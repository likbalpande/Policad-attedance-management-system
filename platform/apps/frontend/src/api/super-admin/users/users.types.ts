export const adminsQueryKey = (orgId?: number) => ["super-admin", "admins", orgId ?? "all"] as const;
export const adminsQueryKeyPrefix = ["super-admin", "admins"] as const;
