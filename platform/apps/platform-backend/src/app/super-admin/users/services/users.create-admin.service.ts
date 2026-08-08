import { usersRepository, organizationsRepository, USERS_CONSTRAINTS } from "@platform/dal";
import { NotFoundError, assertNoUniqueViolation } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import type { CreateAdminDto, AdminUser } from "@platform/types";
import { sanitizeUser } from "../utils/sanitize-user";

// Assigning the admin to an org is not a separate step - users.org_id is
// NOT NULL / single-org-per-admin (see product-idea.txt), so the org is set
// atomically at creation.
export async function createAdmin(input: CreateAdminDto, createdByUserId: number): Promise<AdminUser> {
  const org = await organizationsRepository.findOrganizationById(input.orgId);
  if (!org) throw new NotFoundError("Organization not found");

  try {
    const admin = await usersRepository.createUser({
      ...input,
      role: USER_ROLE.ADMIN,
      passwordGeneratedAt: new Date(),
      createdByUserId,
    });
    return sanitizeUser(admin);
  } catch (err) {
    assertNoUniqueViolation(err, USERS_CONSTRAINTS);
    throw err;
  }
}
