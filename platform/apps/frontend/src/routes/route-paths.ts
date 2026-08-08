export const ROUTE_PATHS = {
  ROOT: "/",
  LOGIN: "/login",
  SUPER_ADMIN: "/super-admin",
  SUPER_ADMIN_ORGANIZATIONS: "/super-admin/organizations",
  SUPER_ADMIN_ADMINS: "/super-admin/admins",
  SUPER_ADMIN_PERMISSIONS: "/super-admin/permissions",
  STAFF: "/staff",
  STAFF_BATCHES: "/staff/batches",
  staffBatchDetail: (batchId: number | string) => `/staff/batches/${batchId}`,
  UNAUTHORIZED: "/unauthorized"
} as const;
