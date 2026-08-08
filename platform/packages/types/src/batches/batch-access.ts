import type { UserRole } from "@platform/permissions";
import type { Batch } from "./batch";

export interface AccessRosterUser {
  id: number;
  identifier: string;
  alias: string | null;
  role: UserRole;
}

export interface FacultyAccessRosterUser extends AccessRosterUser {
  canEdit: boolean;
}

export interface BatchAccess {
  admins: AccessRosterUser[];
  faculties: FacultyAccessRosterUser[];
}

// list/get response shape - create/update/delete return the bare Batch only.
export interface BatchWithAccess extends Batch {
  access: BatchAccess;
}
