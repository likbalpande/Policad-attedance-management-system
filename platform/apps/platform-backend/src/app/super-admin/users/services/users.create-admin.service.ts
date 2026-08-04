import { usersRepository, organizationsRepository, USERS_CONSTRAINTS } from "@platform/dal";
import { ConflictError, NotFoundError, getUniqueViolationConstraint } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import type { CreateAdminDto } from "../dto/create-admin-users.dto";
import { sanitizeUser, type SafeUser } from "../utils/sanitize-user";

// Assigning the admin to an org is not a separate step - users.org_id is
// NOT NULL / single-org-per-admin (see product-idea.txt), so the org is set
// atomically at creation.
export async function createAdmin(input: CreateAdminDto, createdByUserId: number): Promise<SafeUser> {
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
    const constraint = getUniqueViolationConstraint(err);
    if (constraint === USERS_CONSTRAINTS.UQ_IDENTIFIER_ORG_ID) {
      throw new ConflictError("A user with this identifier already exists in this organization");
    }
    if (constraint === USERS_CONSTRAINTS.UQ_EMAIL) {
      throw new ConflictError("A user with this email already exists");
    }
    if (constraint === USERS_CONSTRAINTS.UQ_PHONE) {
      throw new ConflictError("A user with this phone number already exists");
    }
    if (constraint === USERS_CONSTRAINTS.UQ_WHATSAPP) {
      throw new ConflictError("A user with this WhatsApp number already exists");
    }
    throw err;
  }
}
