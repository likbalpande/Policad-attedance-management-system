// Domain application_level_enum vocabularies from table-structure.txt that
// are NOT permission/RBAC-specific (those live in @platform/permissions).
// Shared so packages/db, packages/dal, and any app writing/reading these
// columns use the same literal values - no duplicated string constants.

// Mirrors courses.type.
export const COURSE_TYPE = {
  REGULAR: "regular",
  EVENT: "event",
} as const;
export type CourseType = (typeof COURSE_TYPE)[keyof typeof COURSE_TYPE];

// Mirrors attendances.status / attendance_history.status.
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
} as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

// Mirrors attendances.remark / attendance_history.remark.
export const ATTENDANCE_REMARK = {
  QR_BASED_ATTENDANCE: "qr based attendance",
  ADMIN_TRIGGERED: "admin triggered",
} as const;
export type AttendanceRemark = (typeof ATTENDANCE_REMARK)[keyof typeof ATTENDANCE_REMARK];

// Mirrors webhook_history.status.
export const WEBHOOK_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
} as const;
export type WebhookStatus = (typeof WEBHOOK_STATUS)[keyof typeof WEBHOOK_STATUS];
