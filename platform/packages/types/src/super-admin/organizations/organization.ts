// Wire shape (post-JSON-serialization) - PB's actual row has Date objects for
// createdAt/updatedAt; services format them to ISO strings before returning
// so this type is literally true on both sides, not just structurally close.
export interface Organization {
  id: number;
  name: string;
  logoUrl: string | null;
  webhookUrl: string | null;
  hasLiveAttendanceTrigger: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
