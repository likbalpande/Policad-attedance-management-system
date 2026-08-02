// Shared between PB (issues + refreshes) and LAG (verifies, via public key 2
// for the "origin" hash). See product-idea.txt's login section.

export interface StaffAccessTokenPayload {
  userId: number;
  orgId: number;
  role: "super_admin" | "admin" | "faculty";
  // must match users.login_count in DB for the refresh to be accepted
  loginCount: number;
  // UAI hash, itself asymmetrically signed with private key 2
  origin: string;
}

export interface StudentAccessTokenPayload {
  userId: number;
  orgId: number;
  role: "student";
  // must match users.login_count in DB for the refresh to be accepted -
  // same field/check as StaffAccessTokenPayload. Bumped on every student
  // login (enforces a single active session) and on password reset.
  loginCount: number;
  origin: string;
}

export type AccessTokenPayload = StaffAccessTokenPayload | StudentAccessTokenPayload;
