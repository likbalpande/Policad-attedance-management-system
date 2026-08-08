// Bare batch row shape - what create/update/delete return. list/get attach
// an `access` roster on top of this (see batch-access.ts's BatchWithAccess).
export interface Batch {
  id: number;
  title: string;
  alias: string | null;
  orgId: number;
  createdByUserId: number;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
